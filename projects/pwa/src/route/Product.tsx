import React from 'react';
import { urlBuilder } from '../helper/urlBuilder';
import Header from '../component/Header';
import Content from '../component/Content';
import { AnchorButton } from '../component/Button';
import Rows from '../component/Rows';

export interface ProductProps {
    product: string;
}

const Product = ({ product }: ProductProps) => {
    return (
        <div>
            <Header>{`${product} Guardian`}</Header>
            <Content>
                <Rows>
                    <AnchorButton
                        href={urlBuilder({ product, issue: 'saturday' })}
                    >
                        Saturday issue
                    </AnchorButton>
                    <AnchorButton
                        href={urlBuilder({ product, issue: 'sunday' })}
                    >
                        Sunday issue
                    </AnchorButton>
                </Rows>
            </Content>
        </div>
    );
};

export default Product;
