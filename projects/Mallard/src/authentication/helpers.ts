import {
    membershipAccessTokenKeychain,
    userAccessTokenKeychain,
    resetCredentials,
    casCredentialsKeychain,
} from './storage'
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
import AsyncStorage from '@react-native-community/async-storage'
import {
    fetchCasSubscription,
    CasExpiry,
} from '../services/content-auth-service'

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
 * A wrapper around AsyncStorage, with json handling and standardizing the interface
 * between AsyncStorage and the keychain helper below
 */
const createAsyncCache = <T extends object>(key: string) => ({
    set: (value: T) => AsyncStorage.setItem(key, JSON.stringify(value)),
    get: (): Promise<T | null> =>
        AsyncStorage.getItem(key).then(value => value && JSON.parse(value)),
    reset: (): Promise<boolean> =>
        AsyncStorage.removeItem(key).then(() => true),
})

const casDataCache = createAsyncCache<CasExpiry>('cas-data-cache')

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

const userDataCache = createAsyncCache<UserData>('user-data-cache')

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
    resetCredentialsImpl = resetCredentials,
): Promise<UserData | null> => {
    const [userToken, membershipToken] = await Promise.all([
        userTokenStore.get(),
        membershipTokenStore.get(),
    ])

    if (!userToken) {
        // no userToken - we need to be logged in again
        // make sure everything is reset before doing that
        await resetCredentialsImpl()
        return null
    }

    let newMembershipToken: string | null = null

    if (!membershipToken) {
        // if there's not a membership token then something went wrong,
        // but we can fetch it again
        newMembershipToken = await fetchMembershipAccessTokenImpl(
            userToken.password,
        )
        membershipTokenStore.set(userToken.username, newMembershipToken)
    } else {
        newMembershipToken = membershipToken.password
    }

    const [userDetails, membershipData] = await Promise.all([
        fetchUserDetailsImpl(userToken.password),
        fetchMembershipDataImpl(newMembershipToken),
    ])

    const userData = {
        userDetails,
        membershipData,
    }

    userDataCache.set(userData)

    return userData
}

const fetchCASExpiryForKeychainCredentials = async () => {
    const creds = await casCredentialsKeychain.get()
    if (!creds) return null
    return fetchCasSubscription(creds.username, creds.password)
}

/**
 * This takes the membersDataApiResponse and is responsible for returning a boolean
 * describing whether or not the user has the relevant permissions to use the app
 */
const canViewEdition = (
    membersDataApiResponse: MembersDataAPIResponse,
): boolean => membersDataApiResponse.contentAccess.digitalPack

export {
    fetchAndPersistUserAccessTokenWithIdentity,
    fetchAndPersistUserAccessTokenWithType,
    fetchUserDataForKeychainUser,
    fetchCASExpiryForKeychainCredentials,
    canViewEdition,
    userDataCache,
    casDataCache,
    fetchAndPersistCASExpiry,
}
