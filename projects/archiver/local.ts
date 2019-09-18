import MemWatch from 'node-memwatch'
import * as main from './main'
import { Handler, Context } from 'aws-lambda'
import { IssueParams } from './src/issueTask'
//When run from terminal
MemWatch.on('stats', stats => {
    console.log('GC ran', JSON.stringify(stats))
})
MemWatch.on('leak', ev => {
    console.error('LEAK LEAK LEAK>>>')

    console.error(JSON.stringify(ev, null, 2))
    console.error('>>>LEAK LEAK LEAK')
})
console.log('Node process running on', process.pid)
const task = process.argv[2]
const json = process.argv[3]

if (!(task in main)) {
    console.error(`No task called ${task} present`)
    process.exit(1)
}

const handlers = (main as unknown) as {
    [key: string]: Handler<IssueParams, {}>
}
const handler = handlers[task]

const run = handler(JSON.parse(json), {} as Context, () => {}) as Promise<any>

run.then(x => {
    console.log(x)
    console.log('Finished.')
    process.exit(0)
}).catch((error: any) => {
    console.error(error)
    process.exit(1)
})
