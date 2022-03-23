import { Lambda, Endpoint } from 'aws-sdk';
import dns from 'dns';

export const invoke = async (
    functionName: string,
    invocationType: Lambda.InvocationType,
    payload?: unknown
): Promise<Lambda.InvocationResponse> => {
    let endpoint: Endpoint;
    if (process.env.AWS_SAM_LOCAL) {
        if (invocationType !== 'RequestResponse') {
            invocationType = 'RequestResponse';
        }
        if (await isDomainResolved('host.docker.internal')) {
            endpoint = new Endpoint('http://host.docker.internal:3001');
        } else {
            endpoint = new Endpoint('http://172.17.0.1:3001');
        }
    }
    const lambda = new Lambda({
        endpoint: endpoint
    });
    const params: Lambda.Types.InvocationRequest = {
        FunctionName: functionName,
        InvocationType: invocationType,
        Payload: JSON.stringify(payload)
    };
    return lambda.invoke(params).promise();
};

const isDomainResolved = async (domain: string) => {
    return new Promise((resolve) => {
        dns.promises
            .resolve(domain)
            .then(() => {
                resolve(true);
            })
            .catch(() => {
                resolve(false);
            });
    });
};
