import { Collection, Article } from 'src/common'
import { WithColor } from '../../../common/src'
import { palette } from '@guardian/pasteup/palette'

export interface FlatCard {
    collection: Collection
    articles: Article[]
}

const colorMap = {
    news: palette.news.main,
    opinion: palette.opinion.main,
    sport: palette.sport.main,
    culture: palette.culture.main,
    lifestyle: palette.lifestyle.main,
    neutral: palette.neutral[7],
}

export const getColor = (color: WithColor) => {
    if (color.color === 'custom') return color.customColor
    return colorMap[color.color]
}

export const flattenCollections = (collections: Collection[]): FlatCard[] =>
    collections
        .map(collection =>
            collection.cards.map(({ articles }) => ({
                articles: Object.values(articles || {}),
                collection,
            })),
        )
        .reduce((acc, val) => acc.concat(val), [])
