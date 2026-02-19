export const errMessage = (err, msg = 'Unknown error') => {
    if (err instanceof Error) {
        return err.message;
    }
    if (typeof err === 'object' && err !== null && 'message' in err) {
        return String(err.message);
    }
    return msg;
};
