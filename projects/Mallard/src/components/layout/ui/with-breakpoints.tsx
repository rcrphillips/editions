import React, { useState, ReactElement } from 'react'
import { View, LayoutRectangle, StyleSheet } from 'react-native'
import { getClosestBreakpoint, BreakpointList } from 'src/theme/breakpoints'

const WithBreakpoints = ({
    children,
}: {
    children: BreakpointList<(l: LayoutRectangle) => ReactElement>
}) => {
    const [maxSize, setMaxSize] = useState<keyof typeof children>(0)
    const [metrics, setMetrics] = useState<LayoutRectangle | null>(null)
    return (
        <View
            onLayout={ev => {
                setMetrics(ev.nativeEvent.layout)
                setMaxSize(
                    getClosestBreakpoint(
                        (Object.keys(children) as unknown[]) as number[],
                        ev.nativeEvent.layout.width,
                    ),
                )
            }}
        >
            {metrics && children[maxSize](metrics)}
        </View>
    )
}

export { WithBreakpoints }
