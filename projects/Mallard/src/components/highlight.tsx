import React from 'react'
import {
    Platform,
    StyleProp,
    ViewStyle,
    TouchableWithoutFeedbackProps,
} from 'react-native'
import {
    TouchableNativeFeedback,
    TouchableOpacity,
} from 'react-native-gesture-handler'

const Highlight: React.FC<
    {
        onPress: () => void
        children: React.ReactNode
        style?: StyleProp<ViewStyle>
    } & TouchableWithoutFeedbackProps
> = ({ onPress, children, style }) => {
    return Platform.OS === 'android' ? (
        <TouchableNativeFeedback {...{ style }} onPress={onPress}>
            {children}
        </TouchableNativeFeedback>
    ) : (
        <TouchableOpacity {...{ style }} onPress={onPress}>
            {children}
        </TouchableOpacity>
    )
}

export { Highlight }
