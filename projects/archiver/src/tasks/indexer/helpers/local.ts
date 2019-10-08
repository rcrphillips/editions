import { getIssueSummaries } from './summary'
import { attempt, hasFailed } from '../../../../../backend/utils/try'
import { upload, ONE_MINUTE } from '../../../utils/s3'

/* This file is for testing the indexer locally */

export const summary = async () => {
    const index = await attempt(getIssueSummaries())
    if (hasFailed(index)) {
        console.error(index)
        console.error('Could not fetch index')
        return
    }
    await upload('issues', index, 'application/json', ONE_MINUTE)
    return
}

summary()
    .then(() => {
        process.exit(0)
    })
    .catch(error => {
        console.error(error)
        process.exit(1)
    })