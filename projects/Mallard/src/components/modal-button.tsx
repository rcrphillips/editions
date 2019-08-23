import React from 'react'
import { Button, ButtonAppearance } from './button/button'
import { StyleSheet } from 'react-native'

const styles = StyleSheet.create({
    button: {
        marginTop: 10,
        marginRight: 10,
    },
})

const ModalButton = (props: {
    onPress: () => void
    children: string
    alt?: string
}) => (
    <Button
        {...props}
        alt={props.alt || props.children}
        style={styles.button}
        appearance={ButtonAppearance.light}
    />
)

export { ModalButton }
