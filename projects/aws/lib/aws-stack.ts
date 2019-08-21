import cdk = require('@aws-cdk/core')
import apigateway = require('@aws-cdk/aws-apigateway')
import lambda = require('@aws-cdk/aws-lambda')
import { Code, FunctionProps } from '@aws-cdk/aws-lambda'
import s3 = require('@aws-cdk/aws-s3')
import iam = require('@aws-cdk/aws-iam')
import cloudfront = require('@aws-cdk/aws-cloudfront')
import { CfnOutput, Duration } from '@aws-cdk/core'

import { stateMachineArnEnv } from '../../archiver/src/invoke'
import { archiverStepFunction } from './step-function'
export class EditionsStack extends cdk.Stack {
    constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props)
        const stackParameter = new cdk.CfnParameter(this, 'stack', {
            type: 'String',
            description: 'Stack',
        })

        const stageParameter = new cdk.CfnParameter(this, 'stage', {
            type: 'String',
            description: 'Stage',
        })

        const capiKeyParameter = new cdk.CfnParameter(this, 'capi', {
            type: 'String',
            description: 'Capi key',
        })

        const printSentURLParameter = new cdk.CfnParameter(this, 'psurl', {
            type: 'String',
            description: 'print sent url parameter',
        })

        const frontsRoleARN = new cdk.CfnParameter(this, 'fronts-role-arn', {
            type: 'String',
            description: 'fronts access',
        })

        const imageSalt = new cdk.CfnParameter(this, 'image-signing-key', {
            type: 'String',
            description: 'image signing',
        })

        const archiveBucketParameter = new cdk.CfnParameter(
            this,
            'archive-bucket-param',
            {
                type: 'String',
                description: 'Archive Bucket',
                default: 'editions-store',
                allowedValues: ['editions-store', 'editions-store-code'],
            },
        )

        const cmsFrontsAccountIdParameter = new cdk.CfnParameter(
            this,
            'cmsFronts-account-id-param',
            {
                type: 'String',
                description: 'Account id for cmsFronts account.',
            },
        )

        const publishedEditionsBucketnameParameter = new cdk.CfnParameter(
            this,
            'published-editions-bucket-name-param',
            {
                type: 'String',
                description: 'Name for published editions bucket',
            },
        )

        const deployBucket = s3.Bucket.fromBucketName(
            this,
            'editions-dist',
            'editions-dist',
        )

        const frontsAccess = iam.Role.fromRoleArn(
            this,
            'fronts-role',
            frontsRoleARN.valueAsString,
        )

        const atomLambdaParam = new cdk.CfnParameter(this, 'atom-lambda-arn', {
            type: 'String',
            description: 'lambda access',
        })

        const backendProps = (
            publicationStage: 'preview' | 'published',
        ): FunctionProps => ({
            functionName: `editions-${publicationStage}-backend-${stageParameter.valueAsString}`,
            runtime: lambda.Runtime.NODEJS_10_X,
            memorySize: 512,
            timeout: Duration.seconds(60),
            code: Code.bucket(
                deployBucket,
                `${stackParameter.valueAsString}/${stageParameter.valueAsString}/backend/backend.zip`,
            ),
            handler: 'index.handler',
            environment: {
                CAPI_KEY: capiKeyParameter.valueAsString,
                arn: frontsRoleARN.valueAsString,
                stage: stageParameter.valueAsString,
                atomArn: atomLambdaParam.valueAsString,
                psurl: printSentURLParameter.valueAsString,
                IMAGE_SALT: imageSalt.valueAsString,
                publicationStage,
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ['sts:AssumeRole'],
                    resources: [frontsAccess.roleArn],
                }),
                new iam.PolicyStatement({
                    resources: [atomLambdaParam.valueAsString],
                    actions: ['lambda:InvokeFunction'],
                }),
            ],
        })

        const previewBackend = new lambda.Function(
            this,
            'EditionsPreviewBackend',
            backendProps('preview'),
        )

        const publishedBackend = new lambda.Function(
            this,
            'EditionsPublishedBackend',
            backendProps('published'),
        )

        const gateway = new apigateway.LambdaRestApi(
            this,
            'editions-preview-backend-apigateway',
            {
                handler: previewBackend,
            },
        )
        const publishedGateway = new apigateway.LambdaRestApi(
            this,
            'editions-published-backend-apigateway',
            {
                handler: publishedBackend,
            },
        )

        const gatewayId = gateway.restApiId
        const publishedGatewayId = publishedGateway.restApiId

        const backendURL = `${publishedGatewayId}.execute-api.eu-west-1.amazonaws.com/prod/` //Yes, this (the region) really should not be hard coded.

        const dist = new cloudfront.CloudFrontWebDistribution(
            this,
            'backend-cloudfront-distribution',
            {
                comment: `Cloudfront distribution for editions ${stageParameter.valueAsString}`,
                defaultRootObject: '',
                originConfigs: [
                    {
                        originPath: '/prod', //This is hard coded and could be the deployment id
                        behaviors: [
                            {
                                isDefaultBehavior: true,
                                defaultTtl: Duration.seconds(10),
                            },
                        ],
                        customOriginSource: {
                            domainName: `${gatewayId}.execute-api.eu-west-1.amazonaws.com`, //Yes, this (the region) really should not be hard coded.
                        },
                    },
                ],
            },
        )
        new CfnOutput(this, 'Cloudfront-distribution', {
            description: 'URL for distribution',
            value: `https://${dist.domainName}`,
        })

        const archive = s3.Bucket.fromBucketName(
            this,
            'archive-bucket',
            archiveBucketParameter.valueAsString,
        )

        const archiver = new lambda.Function(this, 'EditionsArchiver', {
            functionName: `editions-archiver-${stageParameter.valueAsString}`,
            runtime: lambda.Runtime.NODEJS_10_X,
            timeout: Duration.minutes(5),
            memorySize: 1500,
            code: Code.bucket(
                deployBucket,
                `${stackParameter.valueAsString}/${stageParameter.valueAsString}/archiver/archiver.zip`,
            ),
            handler: 'index.handler',
            environment: {
                stage: stageParameter.valueAsString,
                bucket: archive.bucketName,
                backend: backendURL,
            },
            initialPolicy: [
                new iam.PolicyStatement({
                    actions: ['*'],
                    resources: [archive.arnForObjects('*'), archive.bucketArn],
                }),
            ],
        })

        new CfnOutput(this, 'archiver-arn', {
            description: 'ARN for achiver lambda',
            value: archiver.functionArn,
        })

        const publishedBucket = s3.Bucket.fromBucketName(
            this,
            'published-bucket',
            publishedEditionsBucketnameParameter.valueAsString,
        )

        new lambda.CfnPermission(
            this,
            'PublishedEditionsArchiverInvokePermission',
            {
                principal: 's3.amazonaws.com',
                functionName: archiver.functionName,
                action: 'lambda:InvokeFunction',
                sourceAccount: cmsFrontsAccountIdParameter.valueAsString,
                sourceArn: publishedBucket.bucketArn,
            },
        )

        //Archiver step function

        const archiverStateMachine = archiverStepFunction(this, {
            stack: stackParameter.valueAsString,
            stage: stageParameter.valueAsString,
            deployBucket,
            outputBucket: archive,
            backendURL,
        })

        new CfnOutput(this, 'archiver-state-machine-arn', {
            description: 'ARN for archiver state machine',
            exportName: `archiver-state-machine-arn-${stageParameter.valueAsString}`,
            value: archiverStateMachine.stateMachineArn,
        })

        const archiveS3EventListener = new lambda.Function(
            this,
            'EditionsArchiverS3EventListener',
            {
                functionName: `editions-archiver-s3-event-listener-${stageParameter.valueAsString}`,
                runtime: lambda.Runtime.NODEJS_10_X,
                timeout: Duration.minutes(5),
                memorySize: 256,
                code: Code.bucket(
                    deployBucket,
                    `${stackParameter.valueAsString}/${stageParameter.valueAsString}/archiver/archiver.zip`,
                ),
                handler: 'index.invoke',
                environment: {
                    stage: stageParameter.valueAsString,
                    [stateMachineArnEnv]: archiverStateMachine.stateMachineArn,
                },
            },
        )

        new CfnOutput(this, 'archiver-s3-event-listener-arn', {
            description: 'ARN for archiver state machine trigger lambda',
            exportName: `archiver-s3-event-listener-arn-${stageParameter.valueAsString}`,
            value: archiveS3EventListener.functionArn,
        })
        new lambda.CfnPermission(
            this,
            'PublishedEditionsArchiverS3EventListenerInvokePermission',
            {
                principal: 's3.amazonaws.com',
                functionName: archiveS3EventListener.functionName,
                action: 'lambda:InvokeFunction',
                sourceAccount: cmsFrontsAccountIdParameter.valueAsString,
                sourceArn: publishedBucket.bucketArn,
            },
        )

        archiverStateMachine.grantStartExecution(archiveS3EventListener)
    }
}
