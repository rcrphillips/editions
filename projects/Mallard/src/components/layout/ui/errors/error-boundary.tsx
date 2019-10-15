import React, { Component } from 'react'
import { FlexErrorMessage } from 'src/components/layout/ui/errors/flex-error-message'
import { GENERIC_FATAL_ERROR } from 'src/helpers/words'
import { errorService } from 'src/services/errors'

class ErrorBoundary extends Component<
    {},
    { hasError: boolean; message: string | undefined }
> {
    constructor(props: {}) {
        super(props)
        this.state = { hasError: false, message: undefined }
    }
    // (ignored 15/10/19)
    // eslint-disable-next-line
    static getDerivedStateFromError(error: any) {
        return { hasError: true, message: JSON.stringify(error) }
    }

    componentDidCatch(err: Error) {
        errorService.captureException(err)
    }

    render() {
        if (this.state.hasError) {
            return (
                <FlexErrorMessage
                    title={GENERIC_FATAL_ERROR}
                    message={`Here's some details; ` + this.state.message}
                ></FlexErrorMessage>
            )
        }

        return this.props.children
    }
}

export { ErrorBoundary }
