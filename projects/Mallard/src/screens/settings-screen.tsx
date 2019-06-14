import React from 'react'
import {
    ScrollView,
    StyleSheet,
    Text,
    Dimensions,
    View,
    AsyncStorage,
    Alert,
} from 'react-native'

import { List, ListHeading } from '../components/lists/list'
import { NavigationScreenProp } from 'react-navigation'
import { container } from '../theme/styles'
import { useSettings } from '../hooks/use-settings'
import { clearLocalCache } from '../hooks/use-fetch'
import { MonoTextBlock } from '../components/styled-text'
import { Highlight } from '../components/highlight'

const styles = StyleSheet.create({
    container,
})

const SettingsScreen = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => {
    const [{ apiUrl, hasLiveDevMenu }, setSetting] = useSettings()
    return (
        <ScrollView style={styles.container}>
            <ListHeading>About this app</ListHeading>
            <MonoTextBlock>
                Thanks for helping us test the Editions app beta! your feedback
                will be invaluable to the final product.
            </MonoTextBlock>
            <MonoTextBlock>
                Come back soon to see relevant settings.
            </MonoTextBlock>
            {!hasLiveDevMenu ? (
                <>
                    <View style={{ height: Dimensions.get('window').height }} />
                    <Highlight
                        style={{ alignItems: 'center' }}
                        onPress={() => {
                            setSetting('hasLiveDevMenu', true)
                        }}
                    >
                        <Text
                            style={{
                                textAlign: 'center',
                                padding: 40,
                            }}
                        >
                            🦆
                        </Text>
                    </Highlight>
                </>
            ) : (
                <>
                    <ListHeading>💣 DEVELOPER ZONE 💣</ListHeading>
                    <MonoTextBlock>
                        Only wander here if you know what you are doing!!
                    </MonoTextBlock>
                    <List
                        onPress={({ onPress }) => onPress()}
                        data={[
                            {
                                key: 'Downloads',
                                title: 'Manage issues',
                                data: {
                                    onPress: () => {
                                        navigation.navigate('Downloads')
                                    },
                                },
                            },
                            {
                                key: 'Endpoints',
                                title: 'API Endpoint',
                                explainer: apiUrl,
                                data: {
                                    onPress: () => {
                                        navigation.navigate('Endpoints')
                                    },
                                },
                            },
                            {
                                key: 'Clear caches',
                                title: 'Clear caches',
                                data: {
                                    onPress: () => {
                                        Alert.alert(
                                            'Clear caches',
                                            'You sure?',
                                            [
                                                {
                                                    text: 'Delete fetch cache',
                                                    onPress: () => {
                                                        clearLocalCache()
                                                    },
                                                },
                                                {
                                                    text: 'Delete EVERYTHING',
                                                    onPress: () => {
                                                        AsyncStorage.clear()
                                                    },
                                                },
                                                {
                                                    style: 'cancel',
                                                    text: `No don't do it`,
                                                },
                                            ],
                                            { cancelable: false },
                                        )
                                    },
                                },
                            },
                            {
                                key: 'Hide this menu',
                                title: 'Hide this menu',
                                explainer:
                                    'Scroll down and tap the duck to bring it back',
                                data: {
                                    onPress: () => {
                                        setSetting('hasLiveDevMenu', false)
                                    },
                                },
                            },
                        ]}
                    />
                </>
            )}
        </ScrollView>
    )
}
SettingsScreen.navigationOptions = {
    title: 'Settings',
}

export { SettingsScreen }
