import React from 'react'
import TestRenderer, { ReactTestRendererJSON } from 'react-test-renderer'
import { LeftChevron } from '../LeftChevron'

describe('LeftChevron', () => {
    it('should display a LeftChevron icon using the icon font', () => {
        const component: ReactTestRendererJSON | null = TestRenderer.create(
            <LeftChevron />,
        ).toJSON()
        expect(component).toMatchSnapshot()
    })
})
