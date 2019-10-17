import { Issue } from 'src/common'
import { useMemo } from 'react'
import { defaultSettings } from 'src/helpers/settings/defaults'
import { londonTime } from './date'

const months = [
    'Jan',
    'Feb',
    'March',
    'April',
    'May',
    'June',
    'July',
    'August',
    'September',
    'October',
    'November',
    'December',
]

const days = [
    'Sunday',
    'Monday',
    'Tuesday',
    'Wednesday',
    'Thursday',
    'Friday',
    'Saturday',
]

interface IssueDate {
    date: string
    weekday: string
}

export const renderIssueDate = (dateString: Issue['date']): IssueDate => {
    const date = londonTime(dateString)
    return {
        date: date.date() + ' ' + months[date.month()],
        weekday: days[date.day()],
    }
}

export const useIssueDate = (issue?: Issue): IssueDate =>
    useMemo(
        () => (issue ? renderIssueDate(issue.date) : { date: '', weekday: '' }),
        [issue && issue.key, issue],
    )

const dateToFolderConvert = (date: Date): string => {
    const pad = (n: number) => (n < 10 ? '0' + n : n)
    return `${date.getUTCFullYear()}-${pad(date.getUTCMonth() + 1)}-${pad(
        date.getUTCDate(),
    )}`
}

/** today as folder given */
export const todayAsFolder = (): string =>
    dateToFolderConvert(londonTime().toDate())

export const todayAsKey = (): string =>
    `${defaultSettings.contentPrefix}/${todayAsFolder()}`

export const lastSevenDays = (): string[] => {
    return Array.from({ length: 7 }, (_, i) => {
        const d = londonTime().toDate()
        d.setDate(d.getDate() - i)
        return dateToFolderConvert(d)
    })
}
