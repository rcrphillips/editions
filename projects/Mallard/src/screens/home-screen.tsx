import React, { useMemo } from 'react'
import {
    Image,
    ScrollView,
    Button,
    StyleSheet,
    View,
    Platform,
} from 'react-native'
import { List, ListHeading } from 'src/components/lists/list'
import { NavigationScreenProp } from 'react-navigation'
import { primaryContainer } from 'src/theme/styles'
import { ApiState } from './settings/api-screen'
import { WithAppAppearance } from 'src/theme/appearance'
import { metrics } from 'src/theme/spacing'
import { useFileList } from 'src/hooks/use-fs'
import { Issue } from 'src/common'
import { renderIssueDate } from 'src/helpers/issues'
import { unzipIssue } from 'src/helpers/files'
import { APP_DISPLAY_NAME, GENERIC_ERROR } from 'src/helpers/words'
import { color } from 'src/theme/color'
import { issueSummaryPath, IssueSummary } from '../../../common/src'
import { useEndpoint } from 'src/hooks/use-fetch'
import { withResponse } from 'src/hooks/use-response'
import { Spinner } from 'src/components/spinner'
import { FlexErrorMessage } from 'src/components/layout/errors/flex-error-message'
import { useSettings } from 'src/hooks/use-settings'
import { FlexCenter } from 'src/components/layout/flex-center'

const demoIssues: Issue[] = [
    {
        key: 'alpha-edition',
        name: 'PROD dummy',
        date: new Date(Date.now()).getTime(),
        fronts: [],
    },
    {
        key: 'dd753c95-b0be-4f0c-98a8-3797374e71b6',
        name: 'CODE dummy',
        date: new Date(Date.now()).getTime(),
        fronts: [],
    },
]

const styles = StyleSheet.create({
    container: primaryContainer,
    welcomeImage: {
        width: 1024 / 8,
        height: 559 / 8,
        resizeMode: 'contain',
    },
    getStartedContainer: {
        alignItems: 'flex-start',
        marginHorizontal: metrics.horizontal,
        marginTop: metrics.vertical * 2,
    },
})

const useIssueSummary = () =>
    withResponse(useEndpoint<IssueSummary[]>(issueSummaryPath()))

export const HomeScreen = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => {
    const [files, { refreshIssues }] = useFileList()
    const issueList = useMemo(
        () =>
            demoIssues.map(issue => ({
                key: issue.key,
                title: renderIssueDate(issue.date).date,
                explainer: issue.key,
                data: {
                    issue: issue.key,
                },
            })),
        demoIssues.map(({ key }) => key),
    )
    const issueSummary = useIssueSummary()
    const [{ isUsingProdDevtools }] = useSettings()

    return (
        <WithAppAppearance value={'primary'}>
            <ScrollView style={styles.container}>
                <View style={styles.getStartedContainer}>
                    <Image
                        source={require('../assets/images/logo.png')}
                        style={styles.welcomeImage}
                    />
                </View>
                <ListHeading>Issues</ListHeading>
                {issueSummary({
                    success: issueList => (
                        <List
                            data={issueList.map(issue => ({
                                title: renderIssueDate(issue.date * 1000).date,
                                explainer: issue.name,
                                key: issue.date + issue.name,
                                data: {
                                    issue: issue.key,
                                },
                            }))}
                            onPress={path =>
                                navigation.navigate('Issue', { path })
                            }
                        />
                    ),
                    error: ({ message }) => (
                        <FlexErrorMessage
                            title={GENERIC_ERROR}
                            message={isUsingProdDevtools ? message : undefined}
                        />
                    ),
                    pending: () => (
                        <FlexCenter>
                            <Spinner></Spinner>
                        </FlexCenter>
                    ),
                })}
                {files.length > 0 && (
                    <>
                        <ListHeading>Issues on device</ListHeading>
                        <List
                            data={files
                                .filter(
                                    ({ type }) =>
                                        type === 'archive' || type === 'issue',
                                )
                                .map(file => ({
                                    key: file.id,
                                    title:
                                        file.type === 'issue'
                                            ? file.issue.name
                                            : 'Compressed issue',
                                    explainer:
                                        file.type === 'issue'
                                            ? `From fs/${file.id}`
                                            : 'Tap to unarchive',
                                    data: file,
                                }))}
                            onPress={file => {
                                if (file.type === 'archive') {
                                    unzipIssue(file.id).then(async () => {
                                        refreshIssues()
                                        navigation.navigate('Issue', {
                                            path: file.id,
                                        })
                                    })
                                } else if (file.type === 'issue') {
                                    navigation.navigate('Issue', {
                                        path: { issue: file.issue.key },
                                        issue: file.issue,
                                    })
                                }
                            }}
                        />
                    </>
                )}
                {isUsingProdDevtools ? (
                    <>
                        <ListHeading>Hardcoded issues</ListHeading>
                        <List
                            data={issueList}
                            onPress={path =>
                                navigation.navigate('Issue', { path })
                            }
                        />
                    </>
                ) : null}
                <ApiState />
            </ScrollView>
        </WithAppAppearance>
    )
}

HomeScreen.navigationOptions = ({
    navigation,
}: {
    navigation: NavigationScreenProp<{}>
}) => ({
    title: APP_DISPLAY_NAME,
    headerRight: (
        <Button
            onPress={() => {
                navigation.navigate('Settings')
            }}
            color={Platform.OS === 'ios' ? color.textOverPrimary : undefined}
            title="Settings"
        />
    ),
})
