import { Handler } from 'aws-lambda'
import { unnest } from 'ramda'
import { attempt, hasFailed } from '../../backend/utils/try'
import { frontPath, Image } from '../common'
import { getImagesFromFront } from '../media'
import { getFront } from './downloader'
import { IssueTaskOutput } from './issueTask'
import { bucket } from './s3'
import { upload } from './upload'

export interface FrontTaskOutput extends IssueTaskOutput {
    images: Image[]
}
export const handler: Handler<IssueTaskOutput, IssueTaskOutput> = async ({
    issueId,
    issue,
    fronts,
}) => {
    const { source, id } = issueId
    const path = `${source}/${id}`
    console.log(`Attempting to upload ${id} to ${bucket}`)
    const [frontId, ...remainingFronts] = fronts

    const maybeFront = await getFront(path, frontId)

    if (hasFailed(maybeFront)) {
        console.error(JSON.stringify(attempt))
        throw new Error(`Could not download front ${frontId}`)
    }

    const images = unnest(getImagesFromFront(maybeFront))

    const frontUpload = await attempt(
        upload(frontPath(id, frontId), maybeFront, 'application/json'),
    )

    if (hasFailed(frontUpload)) {
        console.error(JSON.stringify(frontUpload))
        throw new Error('Could not upload front')
    }
    const publishedFronts = [...issue.fronts, frontId]
    return {
        issueId,
        issue: { ...issue, fronts: publishedFronts },
        images,
        fronts: remainingFronts,
        remainingFronts: remainingFronts.length,
        message: `Succesfully published ${frontId}`,
    }
}