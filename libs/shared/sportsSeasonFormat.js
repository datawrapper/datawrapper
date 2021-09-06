import { FORMAT_DEFAULT } from 'dayjs/esm/constant';

export default (o, c) => {
    // locale needed later
    const proto = c.prototype;
    const oldFormat = proto.format;
    // extend en locale here
    proto.format = function (formatStr) {
        const str = formatStr || FORMAT_DEFAULT;
        const separator = this.$locale().seasonSeparator || '-';

        const result = str.replace(/(\[[^\]]+])|BB|B/g, (match, a) => {
            const year = this.$y;
            const nextYear = year + 1;
            const shortFmt = match === 'B';
            const args1 = shortFmt ? [String(year).slice(-2), 2] : [year, 4];
            const args2 = [String(nextYear).slice(-2), 2];
            return (
                a ||
                `${shortFmt ? "'" : ''}${this.$utils().s(...args1, '0')}${separator}${
                    shortFmt ? "'" : ''
                }${this.$utils().s(...args2, '0')}`
            );
        });
        return oldFormat.bind(this)(result);
    };
};
