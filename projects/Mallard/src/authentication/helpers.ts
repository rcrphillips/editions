import {
    membershipAccessTokenKeychain,
    userAccessTokenKeychain,
    signOutIdentity,
    casCredentialsKeychain,
    casDataCache,
    userDataCache,
    getLegacyUserAccessToken,
    legacyCASUsernameCache,
    legacyCASPasswordCache,
    iapReceiptCache,
    _legacyUserAccessTokenKeychain,
} from '../helpers/storage'
import {
    fetchMembershipData,
    MembersDataAPIResponse,
} from 'src/services/membership-service'
import {
    fetchMembershipAccessToken,
    fetchUserAccessTokenWithIdentity,
    fetchUserAccessTokenWithType,
    TokenType,
    fetchUserDetails,
    User,
} from 'src/services/id-service'
import { fetchCasSubscription } from '../services/content-auth-service'
import { fetchActiveIOSSubscriptionReceipt } from '../services/iap'
import { handleFetchError, withTimeout } from 'src/services/exceptions'

/**
 * This helper attempts to get an Identity user access token with an email and password.
 *
 * It will also cache that token in the keychain if successful.
 *
 * This method will throw an error if it was unsuccesful.
 */
const fetchAndPersistUserAccessTokenWithIdentity = async (
    email: string,
    password: string,
): Promise<string> => {
    const token = await fetchUserAccessTokenWithIdentity(email, password)
    await userAccessTokenKeychain.set(email, token)
    return token
}

/**
 * This helper attempts to use a token from an OAuth provider (that is supported by
 * idenity - currently 'facebook' and 'google') and use that to get an Identity user
 * access token.
 *
 * It will also cache that token in the keychain if successful.
 *
 * This method will throw an error if it was unsuccesful.
 */
const fetchAndPersistUserAccessTokenWithType = async (
    tokenType: TokenType,
    authToken: string,
): Promise<string> => {
    const token = await fetchUserAccessTokenWithType(tokenType, authToken)
    await userAccessTokenKeychain.set(`gu-editions::token::${tokenType}`, token)
    return token
}

/**
 * This helper attempts to get CAS expiry information with a subscriber id and password.
 *
 * It will also cache the parameters and result if successful.
 *
 * This method will throw an error if it was unsuccesful.
 */
const fetchAndPersistCASExpiry = async (
    subscriberId: string,
    password: string,
) => {
    const expiry = await fetchCasSubscription(subscriberId, password)
    casCredentialsKeychain.set(subscriberId, password)
    casDataCache.set(expiry)
    return expiry
}

export interface UserData {
    userDetails: User
    membershipData: MembersDataAPIResponse
}

/**
 * This should be used when you know you want to query members-data-api
 * for live data i.e. when the user has attempted to login or when we
 * want to revalidate a user's signin status (do they still have the right
 * identity subscriptions to use the app)
 *
 * N.b. this function does NOT check whether the user has sufficient permissions,
 * it simply returns the record of permission for a user
 */
const fetchUserDataForKeychainUser = async (
    /* mocks for testing */
    membershipTokenStore = membershipAccessTokenKeychain,
    userTokenStore = userAccessTokenKeychain,
    fetchMembershipDataImpl = fetchMembershipData,
    fetchUserDetailsImpl = fetchUserDetails,
    fetchMembershipAccessTokenImpl = fetchMembershipAccessToken,
    getLegacyUserAccessTokenImpl = getLegacyUserAccessToken,
    userDataCacheImpl = userDataCache,
    legacyUserAccessTokenKeychainImpl = _legacyUserAccessTokenKeychain,
): Promise<UserData | null> => {
    const [userToken, legacyUserToken, membershipToken] = await Promise.all([
        userTokenStore.get(),
        getLegacyUserAccessTokenImpl(),
        membershipTokenStore.get(),
    ])

    const actualUserToken = userToken || legacyUserToken

    if (!actualUserToken) {
        // no userToken - we need to be logged in again
        // make sure everything is reset before doing that
        await signOutIdentity(
            userTokenStore,
            membershipTokenStore,
            userDataCacheImpl,
            legacyUserAccessTokenKeychainImpl,
        )
        return null
    }

    let newMembershipToken: string | null = null

    if (!membershipToken) {
        // if there's not a membership token then something went wrong,
        // but we can fetch it again
        newMembershipToken = await fetchMembershipAccessTokenImpl(
            actualUserToken.password,
        )
        membershipTokenStore.set(actualUserToken.username, newMembershipToken)
    } else {
        newMembershipToken = membershipToken.password
    }

    const [userDetails, membershipData] = await Promise.all([
        withTimeout(
            fetchUserDetailsImpl(actualUserToken.password),
            10000,
        ).catch(
            handleFetchError(async e => {
                const cached = await userDataCache.get()
                if (!cached) throw e
                return cached.userDetails
            }),
        ),
        withTimeout(fetchMembershipDataImpl(newMembershipToken), 10000).catch(
            handleFetchError(async e => {
                const cached = await userDataCache.get()
                if (!cached) throw e
                return cached.membershipData
            }),
        ),
    ])

    const userData = {
        userDetails,
        membershipData,
    }

    userDataCache.set(userData)

    return userData
}

const fetchAndPersistCASExpiryForKeychainCredentials = async () => {
    const creds = await casCredentialsKeychain.get()
    if (!creds) {
        const username = legacyCASUsernameCache.get()
        const password = legacyCASPasswordCache.get()
        if (!username || !password) return null
        return await fetchAndPersistCASExpiry(username, password)
    }
    return fetchAndPersistCASExpiry(creds.username, creds.password)
}

const fetchAndPersistIAPReceiptForCurrentITunesUser = async () => {
    const receipt = await fetchActiveIOSSubscriptionReceipt()
    if (!receipt) {
        return null
    }
    iapReceiptCache.set(receipt)
    return receipt
}

const GUARDIAN_SUFFIXES = ['guardian.co.uk', 'theguardian.com']

const isGuardianEmail = (email: string) =>
    GUARDIAN_SUFFIXES.some(suffix => email.endsWith(suffix))

/**
 * If they have a Guardian email we want to check that they've validated their email,
 * otherwise we don't really mind
 */
const isStaffMember = (userData: UserData) =>
    isGuardianEmail(userData.userDetails.primaryEmailAddress) &&
    userData.userDetails.statusFields.userEmailValidated

/**
 * This takes the membersDataApiResponse and is responsible for returning a boolean
 * describing whether or not the user has the relevant permissions to use the app
 */
const canViewEdition = (userData: UserData): boolean =>
    userData.membershipData.contentAccess.digitalPack || isStaffMember(userData)

export {
    fetchAndPersistUserAccessTokenWithIdentity,
    fetchAndPersistUserAccessTokenWithType,
    fetchAndPersistIAPReceiptForCurrentITunesUser,
    fetchUserDataForKeychainUser,
    fetchAndPersistCASExpiryForKeychainCredentials,
    canViewEdition,
    fetchAndPersistCASExpiry,
    isStaffMember,
}
