import AsyncStorage from '@react-native-community/async-storage'

// Consent switches can be 'unset' or null
export type GdprSwitchSetting = null | boolean
export interface GdprSwitchSettings {
    gdprAllowPerformance: GdprSwitchSetting
    gdprAllowTracking: GdprSwitchSetting
}
export interface Settings extends GdprSwitchSettings {
    apiUrl: string
    isUsingProdDevtools: boolean
    hasOnboarded: boolean
}

/*
we can only store strings to memory
so we need to convert them
*/
type UnsanitizedSetting = Settings[keyof Settings]
const sanitize = (value: UnsanitizedSetting): string => {
    if (typeof value !== 'string') {
        return JSON.stringify(value)
    }
    return value
}
const unsanitize = (value: string): UnsanitizedSetting => {
    try {
        return JSON.parse(value)
    } catch {
        return value
    }
}

/*
Default settings.
This is a bit of a mess
*/
export const backends = [
    {
        title: 'PROD',
        value: 'https://d2cf1ljtg904cv.cloudfront.net/',
    },
    {
        title: 'CODE',
        value: 'https://d2mztzjulnpyb8.cloudfront.net/',
    },
]

export const defaultSettings: Settings = {
    apiUrl: backends[0].value,
    isUsingProdDevtools: false,
    hasOnboarded: false,
    gdprAllowPerformance: null,
    gdprAllowTracking: null,
}

/*
getters & setters
*/
export const getSetting = (setting: keyof Settings) =>
    AsyncStorage.getItem('@Setting_' + setting).then(item => {
        if (!item) {
            return defaultSettings[setting]
        }
        return unsanitize(item)
    })

export const getAllSettings = async (): Promise<Settings> => {
    const settings = await Promise.all(
        (Object.keys(defaultSettings) as (keyof typeof defaultSettings)[]).map(
            key =>
                getSetting(key).then(value => ({
                    key,
                    value,
                })),
        ),
    )
    return settings.reduce(
        (acc, { key, value }) => ({ ...acc, [key]: value }),
        {} as Settings,
    )
}

export const storeSetting = (
    setting: keyof Settings,
    value: string | boolean,
) => {
    return AsyncStorage.setItem('@Setting_' + setting, sanitize(value))
}

export const shouldShowOnboarding = (settings: Settings) =>
    !settings.hasOnboarded
