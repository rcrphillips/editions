import React from 'react'
import { Animated, StyleSheet } from 'react-native'
import {
    createStackNavigator,
    NavigationContainer,
    NavigationInjectedProps,
    NavigationRouteConfig,
    NavigationTransitionProps,
} from 'react-navigation'
import { ariaHidden } from 'src/helpers/a11y'
import { supportsTransparentCards } from 'src/helpers/features'
import { color } from 'src/theme/color'
import {
    NavigatorWrapper,
    addStaticRouterWithPosition,
} from '../helpers/transition'
import { screenInterpolator } from './underlay/transition'
import { addStaticRouter } from '../helpers/base'

const overlayStyles = StyleSheet.create({
    root: {
        ...StyleSheet.absoluteFillObject,
        backgroundColor: color.artboardBackground,
        zIndex: 999999,
    },
})

const addStaticRouterWithOverlay: NavigatorWrapper = (
    navigator,
    getPosition,
) => {
    const Navigator = addStaticRouterWithPosition(navigator, getPosition)
    const Wrapper = ({ navigation }: NavigationInjectedProps) => {
        const posi = getPosition()
        return (
            <>
                <Animated.View
                    {...ariaHidden}
                    pointerEvents="none"
                    style={[
                        overlayStyles.root,
                        {
                            opacity: posi.interpolate({
                                inputRange: [0, 1],
                                outputRange: [0, 0.33],
                            }),
                        },
                    ]}
                />

                <Navigator navigation={navigation} />
            </>
        )
    }
    return addStaticRouter(navigator, Wrapper)
}

const createUnderlayNavigator = (
    top: NavigationContainer,
    bottom: {
        [name: string]: NavigationRouteConfig
    },
) => {
    let animatedValue = new Animated.Value(0)

    const navigation: { [key: string]: NavigationContainer } = {
        _: addStaticRouterWithOverlay(top, () => animatedValue),
    }
    for (const [key, value] of Object.entries(bottom)) {
        navigation[key] = addStaticRouterWithPosition(
            value,
            () => animatedValue,
        )
    }

    const transitionConfig = (transitionProps: NavigationTransitionProps) => {
        animatedValue = transitionProps.position
        return {
            containerStyle: {
                backgroundColor: color.artboardBackground,
            },
            screenInterpolator,
        }
    }

    return createStackNavigator(navigation, {
        initialRouteName: '_',
        defaultNavigationOptions: {
            gesturesEnabled: false,
        },
        cardStyle: {
            shadowOffset: {
                width: 0,
                height: 0,
            },
            overflow: 'visible',
            shadowOpacity: 0.2,
            shadowRadius: 8,
        },
        ...(supportsTransparentCards()
            ? {
                  mode: 'modal',
                  headerMode: 'none',
                  transparentCard: true,
                  cardOverlayEnabled: true,
                  transitionConfig,
              }
            : {}),
    })
}

export { createUnderlayNavigator }