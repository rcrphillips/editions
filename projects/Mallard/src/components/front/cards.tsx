import React from 'react'
import { View, StyleSheet, StyleProp, ViewStyle } from 'react-native'
import { metrics } from '../../theme/spacing'
import { withNavigation, NavigationInjectedProps } from 'react-navigation'
import { Highlight } from '../highlight'
import { HeadlineCardText, HeadlineKickerText } from '../styled-text'

import { useArticleAppearance } from '../../theme/appearance'

const styles = StyleSheet.create({
    root: {
        padding: metrics.horizontal,
        paddingVertical: metrics.vertical / 2,
    },
    elastic: {
        flexGrow: 1,
        flexShrink: 0,
        flexBasis: '100%',
    },
})
const SmallCard = withNavigation(
    ({
        style,
        headline,
        kicker,
        id,
        navigation,
    }: NavigationInjectedProps & {
        style: StyleProp<ViewStyle>
        headline: string
        kicker: string
        id: number
    }) => {
        const { appearance } = useArticleAppearance()
        return (
            <View style={style}>
                <Highlight
                    onPress={() =>
                        navigation.navigate('Article', { article: id })
                    }
                >
                    <View
                        style={[
                            styles.elastic,
                            styles.root,
                            appearance.backgrounds,
                            appearance.cardBackgrounds,
                        ]}
                    >
                        <HeadlineKickerText
                            style={[appearance.text, appearance.kicker]}
                        >
                            {kicker}
                        </HeadlineKickerText>
                        <HeadlineCardText
                            style={[appearance.text, appearance.headline]}
                        >
                            {headline}
                        </HeadlineCardText>
                    </View>
                </Highlight>
            </View>
        )
    },
)

export { SmallCard }
