import { Handler } from 'aws-lambda'
import { IssueSummary, issueSummarySort } from '../../../common'
import { getIssueSummary } from './helpers/get-issue-summary'
import { getIssueSummaries } from './helpers/summary'
import { upload, FIVE_SECONDS } from '../../utils/s3'
import { UploadTaskOutput } from '../upload'
import { handleAndNotify } from '../../services/task-handler'

type IndexTaskInput = UploadTaskOutput
export interface IndexTaskOutput extends UploadTaskOutput {
    issueSummary: IssueSummary
    index: IssueSummary[]
}
export const handler: Handler<
    IndexTaskInput,
    IndexTaskOutput
> = handleAndNotify('indexed', async ({ issuePublication, issue }) => {
    // at the moment we create and recreate these issue summaries every time
    // an optimisation would be to move the issue summary creation to the previous task
    // so it would only have to be done once and can easily be read in and stiched together
    const thisIssueSummary = await getIssueSummary(issuePublication)

    if (thisIssueSummary == undefined) {
        throw new Error('No issue summary was generated for the current issue')
    }

    const otherIssueSummaries = await getIssueSummaries(issuePublication)

    console.log(
        `Creating index using the new and ${otherIssueSummaries.length} existing issue summaries`,
    )

    const allIssues = issueSummarySort([
        thisIssueSummary,
        ...otherIssueSummaries,
    ])

    await upload(
        `${issuePublication.edition}/issues`,
        allIssues,
        'application/json',
        FIVE_SECONDS,
    )

    // Also upload the index into the root for older clients
    // TODO: this can be removed once we are happy that the clients are consuming the namespaced index
    if (issuePublication.edition === 'daily-edition') {
        await upload('issues', allIssues, 'application/json', FIVE_SECONDS)
    }

    console.log('Uploaded new issues file')

    return {
        issuePublication,
        index: otherIssueSummaries,
        issue,
        issueSummary: thisIssueSummary,
    }
})