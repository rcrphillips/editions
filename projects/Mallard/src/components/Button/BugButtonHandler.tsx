import React from 'react'
import { useContext } from 'react'
import { BugButton } from './BugButton'
import { isInBeta } from 'src/helpers/release-stream'
import { AccessContext } from 'src/authentication/AccessContext'
import { useApolloClient } from '@apollo/react-hooks'
import { createMailtoHandler } from 'src/helpers/diagnostics'
import { DIAGNOSTICS_TITLE } from 'src/helpers/words'

const BugButtonHandler = () => {
    const { attempt } = useContext(AccessContext)
    const client = useApolloClient()
    return isInBeta() ? (
        <BugButton
            onPress={createMailtoHandler(
                client,
                'Report a bug',
                '',
                attempt,
                DIAGNOSTICS_TITLE,
            )}
        />
    ) : null
}

export { BugButtonHandler }
