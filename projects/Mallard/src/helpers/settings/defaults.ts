import { Settings } from '../settings'

/*
Default settings.
This is a bit of a mess
*/
export const backends = [
    {
        title: 'PROD published',
        value: 'https://editions-store-prod.s3-eu-west-1.amazonaws.com/',
        preview: false,
    },
    {
        title: 'PROD preview',
        value: 'https://preview.editions.guardianapis.com/',
        preview: true,
    },
    {
        title: 'CODE published',
        value: 'https://editions.code.dev-guardianapis.com/',
        preview: false,
    },
    {
        title: 'CODE preview',
        value: 'https://preview.editions.code.dev-guardianapis.com/',
        preview: true,
    },
    {
        title: 'DEV',
        value: 'http://localhost:3131/',
        preview: true,
    },
] as {
    title: string
    value: string
    preview: boolean
}[]

export const notificationServiceRegister = {
    prod: 'https://notifications.guardianapis.com/device/register',
    code: 'https://notifications.code.dev-guardianapis.com/device/register',
}

const apiUrl = backends[0].value

export const defaultSettings: Settings = {
    apiUrl,
    isUsingProdDevtools: false,
    hasOnboarded: false,
    gdprAllowEssential: true, // essential defaults to true and not switchable
    gdprAllowPerformance: null,
    gdprAllowFunctionality: null,
    gdprConsentVersion: null,
    gdprAllowOphan: true, // 'essential' so defaults to true and not switchable
    gdprAllowSentry: null,
    gdprAllowFacebookLogin: null,
    gdprAllowGoogleLogin: null,
    notificationServiceRegister: __DEV__
        ? notificationServiceRegister.code
        : notificationServiceRegister.prod,
    zipUrl: apiUrl + 'zips',
    cacheClearUrl: apiUrl + 'cache-clear',
    contentPrefix: 'daily-edition',
}

export const isPreview = (apiUrl: Settings['apiUrl']): boolean => {
    const backend = backends.find(backend => backend.value === apiUrl)
    return (backend && backend.preview) || false
}
