import { PillarColours } from '@guardian/pasteup/palette'
import { ArticleType, Image as ImageT, Issue } from 'src/common'
import { css, getScaledFontCss, html, px } from 'src/helpers/webview'
import { useImagePath } from 'src/hooks/use-image-paths'
import { Breakpoints } from 'src/theme/breakpoints'
import { color } from 'src/theme/color'
import { metrics } from 'src/theme/spacing'
import { families } from 'src/theme/typography'
import { ArticleHeaderProps } from '../article-header/types'
import { WrapLayout } from '../wrap/wrap'
import { breakSides } from './helpers/layout'
import { Quotes } from './icon/quotes'
import { Line } from './line'
import { Rating } from './rating'
import { CreditedImage } from '../../../../../common/src'

const outieKicker = (type: ArticleType) => css`
    .header-container[data-type='${type}'] .header-kicker {
        display: inline-block;
        height: 3em;
        margin-top: -3em;
        padding-right: ${metrics.article.sidesTablet};
        margin-left: -10em;
        padding-left: 10em;
        border: none;
        z-index: 9;
    }
    .header-container[data-type='${type}'] .header {
        position: relative;
        z-index: 9;
    }
`

const outieHeader = (type: ArticleType) => css`
    .header-container[data-type='${type}'] .header {
        ${breakSides}
        margin-top: -4em;
        padding-top: 0;
        margin-left: -50em;
        padding-left: 50em;
    }
    .header-container[data-type='${type}'] {
        padding-top: 1px;
    }
    @media (max-width: ${px(Breakpoints.tabletVertical)}) {
        .header-container[data-type='${type}'] .header {
            margin-right: 4em;
        }
        .header-container[data-type='${type}'] .header:after {
            margin-right: -4em;
        }
    }
    ${outieKicker(type)}
`

export const headerStyles = ({
    colors,
    wrapLayout,
}: {
    colors: PillarColours
    wrapLayout: WrapLayout
}) => css`
    .header:after {
        background-image: repeating-linear-gradient(
            to bottom,
            ${color.dimLine},
            ${color.dimLine} 0.0625rem,
            transparent 0.0625rem,
            transparent 0.25rem
        );
        background-repeat: repeat-x;
        background-position: bottom;
        background-size: 0.0625rem 0.8125rem;
        content: '';
        display: block;
        height: 0.8125rem;
        margin: 0;
    }
    @media (min-width: ${px(Breakpoints.tabletVertical)}) {
        .header:after {
            margin-right: ${px(metrics.article.sidesTablet * -1)};
        }
    }
    .header {
        padding-top: ${px(metrics.vertical)};
    }
    .header-container-line-wrap,
    .header-container {
        position: relative;
        -webkit-user-select: none;
        -webkit-user-drag: none;
    }
    .header-container-line-wrap {
        z-index: 100;
        ${breakSides}
    }
    .header-bg {
        left: -50em;
        right: -50em;
        top: 0;
        bottom: 0;
        position: absolute;
        z-index: -1;
    }
    .header-image {
        height: 10%;
        width: 100%;
        object-fit: cover;
        display: block;
        z-index: 99;
        position: relative;
    }
    .header-image > .rating {
        position: absolute;
        bottom:0;
        left:0;
    }
    .header-image.header-image--immersive {
        margin: 0 ${px(metrics.article.sidesTablet * -1)};
        width: ${px(wrapLayout.width + metrics.article.sidesTablet * 2)};
        padding-top: 100%;
    }
    @media (max-width: ${px(Breakpoints.tabletVertical)}) {
        .header-image.header-image--immersive {
            padding-top: 140%;
        }
    }

    .header-kicker {
        font-family: ${families.titlepiece.regular};
        font-size: 0.9em;
        color: ${colors.main};
        padding: 0.25rem 0 1rem;
        border-bottom: 1px solid ${color.dimLine};
        display: block;
    }
    .header h1 {
        ${getScaledFontCss('headline', 1.6)}
        font-family: ${families.headline.regular};
        font-weight: 400;
        margin: 0.1em 1em 0.75em 0;
        word-wrap: none;
    }
    .header h1 svg {
        height: .7em;
        transform: scale(1.1);
        width: auto;
        fill: ${colors.main};
    }
    .header-byline:not(:empty) {
        font-weight: 600;
        padding: 0.25rem 0 2rem;
        color: ${colors.main};
        position: relative;
    }
    .header-byline:not(:empty):after {
        content: '';
        display: block;
        height: 1px;
        background-color: ${color.dimLine};
        position: absolute;
        bottom: -1px;
        left: ${px(metrics.article.sidesTablet * -1)};
        right: ${px(metrics.article.sidesTablet * -1)};
    }
    @media (min-width: ${px(Breakpoints.tabletVertical)}) {
        .header-byline:not(:empty):after {
            left: 0;
        }
    }

    .header-top p {
        font-size: 1.05em;
    }

    .header-container:after {
        content: '';
        display: block;
        height: 0;
        margin: 0 -50em;
    }
    .header-opinion-flex {
        display: flex;
        align-items: flex-end;
    }

    .header-opinion-flex > :first-child {
        flex: 1 1 0;
    }

    .header-opinion-flex > :last-child {
        width: 15%;
        overflow: visible;
        flex: 0 0 auto;
    }

    .header-opinion-flex > :last-child img {
        width: 240%;
        display: block;
        float: right;
    }

    .image-as-bg {
        display: block;
        padding-top: 60%;
        background-size: cover;
        background-position: center;
        position: relative;
    }

    .image-as-bg-info {
        position: absolute;
        top:0;
        left:0;
        bottom:0;
        right:0;
        padding: ${px(metrics.vertical)} ${px(metrics.horizontal)};
        color: ${color.palette.neutral[100]};
        background: rgba(20,20,20,.8);
        font-family: ${families.sans.regular};
        z-index: 1;
        display:none;
    }

    .image-as-bg[data-open=true] .image-as-bg-info {
        display:block;
    }

    .image-as-bg > button {
        position: absolute;
        bottom: ${px(metrics.vertical)};
        right: ${px(metrics.horizontal)};
        z-index: 2;
        font-family: ${families.icon.regular};
        background-color: ${colors.main};
        color: ${color.textOverDarkBackground};
        border:none;
        width: 2em;
        height: 2em;
        display: block;
        line-height: .9;
        text-align: center;
        font-size: 1.2em;
        border-radius: 100%;
    }

    /*review*/
    .header-container[data-type='review']:after {
        border-bottom: 1px solid ${color.dimLine};
    }
    .header-container[data-type='review'] .header-bg {
        background-color: ${colors.faded};
    }
    .header-container[data-type='review'] h1 {
        color: ${colors.dark};
        ${getScaledFontCss('headline', 1.5)}
        font-family: ${families.headline.bold};
    }
    .header-container[data-type='review'] .header-byline {
        color: ${colors.dark};
    }
    .header-container[data-type='review'] p {
        color: ${colors.dark};
    }

    /*opinion*/
    .header-container[data-type='opinion']:after {
        border-bottom: 1px solid ${color.dimLine};
    }
    .header-container[data-type='opinion'] .header-bg {
        background-color: ${color.palette.opinion.faded};
    }
    .header-container[data-type='opinion'] .header-kicker {
        display: none;
    }
    .header-container[data-type='opinion'] .header-byline {
        color: ${color.palette.neutral[46]};
    }
    .header-container[data-type='opinion'] h1 {
        font-family: ${families.headline.light};
    }
    .header-container[data-type='opinion'] h1 .header-top-byline {
        color: ${colors.main};
        display: block;
        font-family: ${families.titlepiece.regular};
    }


    /*analysis*/
    .header-container[data-type='analysis']:after {
        border-bottom: 1px solid ${color.dimLine};
    }
    .header-container[data-type='analysis'] .header-bg {
        background-color: ${color.palette.neutral[93]};
    }
    .header-container[data-type='analysis'] .header-kicker {
        display: none;
    }
    .header-container[data-type='analysis'] .header-byline {
        color: ${color.palette.neutral[46]};
    }
    .header-container[data-type='analysis'] h1 {
        font-family: ${families.headline.light};
    }
    .header-container[data-type='analysis'] h1 .header-top-headline {
        text-decoration: underline;
        text-decoration-color: ${colors.main};
        text-decoration-thickness: 1px;
    }
    .header-container[data-type='analysis'] h1 .header-top-byline {
        color: ${colors.main};
        display: block;
        font-family: ${families.titlepiece.regular};
    }

    /*immersive*/
    ${outieHeader(ArticleType.Immersive)}
    .header-container[data-type='immersive'] .header-bg {
        background-color: ${color.palette.neutral[100]};
    }
    .header-container[data-type='immersive'] .header {
        background-color: ${color.palette.neutral[100]};
    }
    .header-container[data-type='immersive'] .header-kicker {
        display: none;
    }
    .header-container[data-type='immersive'] .header-top h1 {
        font-family: ${families.titlepiece.regular};
        color: ${colors.dark};
    }
    .header-container[data-type='immersive'] .header-byline {
        color: ${colors.dark};
    }

    /*longread*/
    ${outieHeader(ArticleType.Longread)}
    .header-container[data-type='longread'] {
        color: ${color.textOverDarkBackground};
    }
    .header-container[data-type='longread'] .header-bg {
        background-color: ${color.palette.neutral[7]};
    }
    .header-container[data-type='longread'] .header {
        background-color: ${color.palette.neutral[7]};
    }
    .header-container[data-type='longread'] .header-kicker {
        background-color: ${colors.main};
        color: ${color.textOverDarkBackground};
        font-family: ${families.headline.bold};
    }
    .header-container[data-type='longread'] .header-top h1 {
        font-family: ${families.titlepiece.regular};
    }
    .header-container[data-type='longread'] .header-byline {
        color: ${color.textOverDarkBackground};
    }


    /*obit*/
    ${outieKicker(ArticleType.Obituary)}
    .header-container[data-type='${ArticleType.Obituary}'] {
        color: ${color.textOverDarkBackground};
    }
    .header-container[data-type='${ArticleType.Obituary}'] .header-bg {
        background-color: ${color.palette.neutral[20]};
    }
    .header-container[data-type='${ArticleType.Obituary}'] .header {
        background-color: ${color.palette.neutral[20]};
    }
    .header-container[data-type='${ArticleType.Obituary}'] .header-kicker {
        background-color: ${color.palette.neutral[20]};
        color: ${color.textOverDarkBackground};
        font-family: ${families.headline.bold};
    }
    .header-container[data-type='${ArticleType.Obituary}'] .header-top h1 {
        font-family: ${families.titlepiece.regular};
    }
    .header-container[data-type='${ArticleType.Obituary}'] .header-byline {
        color: ${color.textOverDarkBackground};
    }
`

const Image = ({ image, className }: { image: ImageT; className?: string }) => {
    const path = useImagePath(image)
    return html`
        <img class="${className}" src="${path}" />
    `
}

const ImageAsBg = ({
    image,
    className,
    children,
}: {
    image: CreditedImage
    className?: string
    children?: string
}) => {
    const path = useImagePath(image)
    return html`
        <div
            class="image-as-bg ${className}"
            style="background-image: url(${path}); "
            data-open="false"
        >
            <button
                aria-hidden
                onclick="this.parentNode.dataset.open = !JSON.parse(this.parentNode.dataset.open)"
            >
                
            </button>
            <div class="image-as-bg-info">${image.credit}</div>
            ${children}
        </div>
    `
}

const isImmersive = (type: ArticleType) =>
    type === ArticleType.Immersive ||
    type === ArticleType.Longread ||
    type === ArticleType.Obituary

const hasLargeByline = (type: ArticleType) =>
    type === ArticleType.Opinion || type === ArticleType.Analysis

const Header = ({
    publishedId,
    type,
    ...headerProps
}: {
    publishedId: Issue['publishedId'] | null
    type: ArticleType
} & ArticleHeaderProps) => {
    const immersive = isImmersive(type)
    const largeByline = hasLargeByline(type)
    const cutout =
        type === ArticleType.Opinion &&
        headerProps.bylineImages &&
        headerProps.bylineImages.cutout
    return html`
        ${immersive &&
            headerProps.image &&
            publishedId &&
            ImageAsBg({
                image: headerProps.image,
                className: 'header-image header-image--immersive',
            })}
        <div class="header-container-line-wrap">
            ${Line({ zIndex: 10 })}
            <div class="header-container wrapper" data-type="${type}">
                <header class="header">
                    ${!immersive &&
                        headerProps.image &&
                        publishedId &&
                        ImageAsBg({
                            className: 'header-image',
                            image: headerProps.image,
                            children: headerProps.starRating
                                ? Rating(headerProps)
                                : undefined,
                        })}
                    <span class="header-kicker">${headerProps.kicker}</span>
                    ${largeByline
                        ? html`
                              <section class="header-top">
                                  <div
                                      class="${cutout && `header-opinion-flex`}"
                                  >
                                      <h1>
                                          ${type === ArticleType.Opinion &&
                                              Quotes()}
                                          <span class="header-top-headline"
                                              >${headerProps.headline}</span
                                          >
                                          <span class="header-top-byline"
                                              >${headerProps.byline}</span
                                          >
                                      </h1>
                                      ${publishedId &&
                                          cutout &&
                                          html`
                                              <div>
                                                  ${Image({
                                                      image: cutout,
                                                  })}
                                              </div>
                                          `}
                                  </div>
                              </section>
                          `
                        : html`
                              <section class="header-top">
                                  <h1>
                                      ${headerProps.headline}
                                  </h1>
                                  <p>${headerProps.standfirst}</p>
                              </section>
                          `}
                </header>

                <aside class="header-byline">
                    <span
                        >${largeByline
                            ? headerProps.standfirst
                            : headerProps.byline}</span
                    >
                </aside>
                <div class="header-bg"></div>
            </div>
        </div>
    `
}

export { Header }