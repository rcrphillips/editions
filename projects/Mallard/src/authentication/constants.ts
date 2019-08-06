import { Platform } from 'react-native'

import Config from 'react-native-config'

const { ID_API_URL, MEMBERS_DATA_API_URL, ID_ACCESS_TOKEN } = Config

const FACEBOOK_CLIENT_ID = '180444840287'

const CAS_ENDPOINT_URL = 'https://content-auth.guardian.co.uk/subs'

const GOOGLE_CLIENT_ID =
    Platform.OS === 'android'
        ? __DEV__
            ? '774465807556-5oq58e8pnfqn9sptsivri5kcs9mthef9'
            : '774465807556-cjat38acttpl7md4nfc4pfediouh7v97'
        : '774465807556-kgaj5an4pc4fmr3svp5nfpulekc1rl3n'

export {
    CAS_ENDPOINT_URL,
    ID_API_URL,
    MEMBERS_DATA_API_URL,
    ID_ACCESS_TOKEN,
    FACEBOOK_CLIENT_ID,
    GOOGLE_CLIENT_ID,
}
