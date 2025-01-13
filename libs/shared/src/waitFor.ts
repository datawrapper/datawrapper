/**
 * wait for test() to return true
 *
 * @param test - test method
 * @param options.interval - number of ms to wait between tests, default 100
 * @param options.timeout - throw exception after [timeout] ms, default 15000
 */
export async function waitFor(
    test: CallableFunction,
    {
        interval,
        timeout,
        message,
    }: Partial<{ interval: number; timeout: number; message: string }> = {}
) {
    interval = interval ?? 100;
    timeout = timeout ?? 15000;
    let result;
    let timedOut = false;
    const timer = setTimeout(() => {
        timedOut = true;
    }, timeout);
    for (
        let maybePromise = test();
        !(result = maybePromise instanceof Promise ? await maybePromise : maybePromise);
        maybePromise = test()
    ) {
        if (timedOut) throw new Error(message ?? 'waitFor timeout exceeded');
        await new Promise(resolve => setTimeout(resolve, interval));
    }
    clearTimeout(timer);
    return result;
}
