import React, { ReactNode } from 'react'
import { StyleSheet, ScrollView, View } from 'react-native'
import { useAppAppearance } from 'src/theme/appearance'

const styles = StyleSheet.create({
    container: { flex: 1 },
})

const ScrollContainer = ({ children }: { children: ReactNode }) => {
    const { backgroundColor } = useAppAppearance()
    return (
        <ScrollView style={[styles.container, { backgroundColor }]}>
            {children}
        </ScrollView>
    )
}

const Container = ({ children }: { children: ReactNode }) => {
    const { backgroundColor } = useAppAppearance()
    return (
        <View style={[styles.container, { backgroundColor }]}>{children}</View>
    )
}

export { Container, ScrollContainer }
