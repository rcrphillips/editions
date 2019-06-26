import { Request, Response } from 'express'

import { s3fetch } from '../s3'
import { Issue } from '../common'
import { lastModified, LastModifiedUpdater } from '../lastModified'

const getIssue = async (
    issue: string,
    lastModifiedUpdater: LastModifiedUpdater,
): Promise<Issue | 'notfound'> => {
    const x = await s3fetch(`frontsapi/edition/${issue}/edition.json`)
    if (x.status === 404) return 'notfound'
    if (!x.ok) throw new Error('failed s3')
    lastModifiedUpdater(x.lastModified)
    return x.json().then(res => ({ ...res, key: issue })) as Promise<Issue>
}

export const issueController = (req: Request, res: Response) => {
    const id: string = req.params.issueId
    const [date, updater] = lastModified()
    getIssue(id, updater)
        .then(data => {
            res.setHeader('Last-Modifed', date())
            res.setHeader('Content-Type', 'application/json')
            res.send(JSON.stringify(data))
        })
        .catch(e => console.error(e))
}
