/**
 * CSV
 *
 * @author Adama dodo cisse <adama.dodo.cisse@gmail.com>
 */
class CSV {
    /**
     * Normalize string to csv format
     *
     * @param string
     * @return {string}
     */
    normalize(string) {
        string = string + "";
        string = string
            .replace(/"/g, '""')
            .replace(/(\n\r|\n)/g, " ")

        return '"' + string + '"';
    }

    /**
     * Convert object array to csv string
     *
     * @param {Array} data
     * @return {string}
     */
    convert(data) {

        if (!data?.length) {
            return '';
        }

        const headers = Object.keys(data[0]);
        const lines = [];
        let line = [];

        for (const header of headers) {
            line.push(this.normalize(header ?? ''))
        }

        lines.push(line.join(','))

        for (const element of data) {
            line = [];
            for (const header of headers) {
                line.push(this.normalize(element[header] ?? ''))
            }
            lines.push(line.join(','))
        }

        return lines.join('\n');
    }
}