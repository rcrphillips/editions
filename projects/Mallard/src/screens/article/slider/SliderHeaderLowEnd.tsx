import React, { useEffect, useState } from 'react'
import { Animated, Easing, Platform, StyleSheet, View } from 'react-native'
import { color } from 'src/theme/color'
import { metrics } from 'src/theme/spacing'
import { BasicArticleHeader } from '../header'
import { SliderTitle, SliderTitleProps } from './SliderTitle'
import DeviceInfo from 'react-native-device-info'

const HEADER_LOW_END_HEIGHT = DeviceInfo.isTablet()
    ? Platform.OS === 'ios'
        ? 160
        : 140
    : 110

const styles = StyleSheet.create({
    slider: {
        paddingBottom: metrics.vertical,
        paddingTop: metrics.vertical / 2,
        justifyContent: 'center',
        alignItems: 'center',
        borderBottomWidth: StyleSheet.hairlineWidth,
        borderBottomColor: color.line,
        backgroundColor: color.background,
        paddingHorizontal: metrics.horizontal,
    },
    sliderAtTop: {
        borderBottomColor: color.background,
    },
    header: {
        position: 'absolute',
        height: HEADER_LOW_END_HEIGHT,
        left: 0,
        right: 0,
    },
})

const SliderHeaderLowEnd = ({
    isShown,
    isAtTop,
    sliderDetails,
}: {
    isShown: boolean
    isAtTop: boolean
    sliderDetails: SliderTitleProps
}) => {
    const [top] = useState(new Animated.Value(0))
    useEffect(() => {
        if (isShown) {
            Animated.timing(top, {
                toValue: 0,
                easing: Easing.out(Easing.ease),
                duration: 200,
            }).start()
        } else {
            Animated.timing(top, {
                toValue: -HEADER_LOW_END_HEIGHT,
                easing: Easing.out(Easing.ease),
                duration: 200,
            }).start()
        }
    }, [isShown, top])

    return (
        <Animated.View style={[styles.header, { top }]}>
            <BasicArticleHeader />
            <View style={[styles.slider, isAtTop ? styles.sliderAtTop : null]}>
                <SliderTitle {...sliderDetails} />
            </View>
        </Animated.View>
    )
}

export { SliderHeaderLowEnd, HEADER_LOW_END_HEIGHT }
