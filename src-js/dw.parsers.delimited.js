(function(){

      // Datawrapper.Parsers.Delimited
      // -----------------------------

   /**
    * Smart delimited data parser.
    * - Handles CSV and other delimited data.
    * Includes auto-guessing of delimiter character
    * Parameters:
    *   options
    *     delimiter : ","
    */
   Datawrapper.Parsers.Delimited = function(options) {
      options = options || {};

      this.delimiter = options.delimiter || ",";

      this.quoteChar = options.quoteChar || "\"";

      this.skipRows = options.skipRows || 0;

      this.emptyValue = options.emptyValue || null;

      this.transpose = options.transpose || false;

      this.firstRowIsHeader = options.firstRowIsHeader !== undefined ? options.firstRowIsHeader : true;

      this.firstColumnIsHeader = options.firstRowIsHeader !== undefined ? options.firstColumnIsHeader : true;

      this.getDelimiterPatterns = function(delimiter, quoteChar) {
         return new RegExp(
            (
            // Delimiters.
            "(\\" + delimiter + "|\\r?\\n|\\r|^)" +
            // Quoted fields.
            "(?:" + quoteChar + "([^" + quoteChar + "]*(?:" + quoteChar + "\"[^" + quoteChar + "]*)*)" + quoteChar + "|" +
            // Standard fields.
            "([^" + quoteChar + "\\" + delimiter + "\\r\\n]*))"), "gi");
      };

      this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);
   };


   _.extend(Datawrapper.Parsers.Delimited.prototype, Datawrapper.Parsers.prototype, {

      parse: function(data) {

         this.__rawData = data;

         if (this.delimiter == 'auto') {
            this.delimiter = this.guessDelimiter(data, this.skipRows);
            this.__delimiterPatterns = this.getDelimiterPatterns(this.delimiter, this.quoteChar);

         }
         var columns = [],
            closure = this.delimiter != '|' ? '|' : '#',
            arrData;

         data = closure + data.replace(/\s+$/g, '') + closure;

         var parseCSV = function(delimiterPattern, strData, strDelimiter) {
            // implementation and regex borrowed from:
            // http://www.bennadel.com/blog/1504-Ask-Ben-Parsing-CSV-Strings-With-Javascript-Exec-Regular-Expression-Command.htm

            // Check to see if the delimiter is defined. If not,
            // then default to comma.
            strDelimiter = (strDelimiter || ",");

            // Create an array to hold our data. Give the array
            // a default empty first row.
            var arrData = [
               []
            ];

            // Create an array to hold our individual pattern
            // matching groups.
            var arrMatches = null,
               strMatchedValue;

            // Keep looping over the regular expression matches
            // until we can no longer find a match.
            while (arrMatches = delimiterPattern.exec(strData)) {
               // Get the delimiter that was found.
               var strMatchedDelimiter = arrMatches[1];

               // Check to see if the given delimiter has a length
               // (is not the start of string) and if it matches
               // field delimiter. If id does not, then we know
               // that this delimiter is a row delimiter.
               if (
               strMatchedDelimiter.length && (strMatchedDelimiter != strDelimiter)) {

                  // Since we have reached a new row of data,
                  // add an empty row to our data array.
                  arrData.push([]);

               }


               // Now that we have our delimiter out of the way,
               // let's check to see which kind of value we
               // captured (quoted or unquoted).
               if (arrMatches[2]) {

                  // We found a quoted value. When we capture
                  // this value, unescape any double quotes.
                  strMatchedValue = arrMatches[2].replace(new RegExp("\"\"", "g"), "\"");

               } else {

                  // We found a non-quoted value.
                  strMatchedValue = arrMatches[3];

               }


               // Now that we have our value string, let's add
               // it to the data array.
               arrData[arrData.length - 1].push(strMatchedValue);
            }

            // remove closure
            if (arrData[0][0].substr(0,1) == closure) {
               arrData[0][0] = arrData[0][0].substr(1);
            }
            var p = arrData.length-1,
               q = arrData[p].length-1,
               r = arrData[p][q].length-1;
            if (arrData[p][q].substr(r) == closure) {
               arrData[p][q] = arrData[p][q].substr(0, r);
            }

            // Return the parsed data.
            return (arrData);
         },

         transpose = function(arrMatrix) {
            // borrowed from:
            // http://www.shamasis.net/2010/02/transpose-an-array-in-javascript-and-jquery/
            var a = arrMatrix,
               w = a.length ? a.length : 0,
               h = a[0] instanceof Array ? a[0].length : 0;
            if (h === 0 || w === 0) {
               return [];
            }
            var i, j, t = [];
            for (i = 0; i < h; i++) {
               t[i] = [];
               for (j = 0; j < w; j++) {
                  t[i][j] = a[j][i];
               }
            }
            return t;
         };

         parseDataArray = function(arrData, skipRows, emptyValue, firstRowIsHeader, firstColIsHeader) {
            var series = [],
               seriesNames = {},
               rowCount = arrData.length,
               columnCount = arrData[0].length,
               rowIndex = skipRows;

            // compute series
            var srcColumns = [];
            if (firstRowIsHeader) {
               srcColumns = arrData[rowIndex];
               rowIndex++;
            }

            // check that columns names are unique and not empty

            for (var c=0; c<columnCount; c++) {
               var col = _.isString(srcColumns[c]) ? srcColumns[c].replace(/^\s+|\s+$/g, '') : '',
                  suffix = col !== '' ? '' : 1;
               col = col !== '' ? col : 'X.';
               while (seriesNames[col+suffix] !== undefined) {
                  suffix = suffix === '' ? 1 : suffix + 1;
               }
               series.push({ name: col+suffix, data: [] });
               seriesNames[col+suffix] = true;
            }

            for (; rowIndex < rowCount; rowIndex++) {
               _.each(series, function(s, i) {
                  s.data.push(arrData[rowIndex][i] !== '' ? arrData[rowIndex][i] : emptyValue);
               });
            }

            var header;
            if (firstColIsHeader) {
               header = series[0];
               series = series.slice(1);
            }

            return {
               series: series,
               rowNames: header ? header.data : undefined,
               rowNameLabels: header ? header.name : undefined
            };
         }, // end parseDataArray

         arrData = parseCSV(this.__delimiterPatterns, data, this.delimiter);
         if (this.transpose) {
            arrData = transpose(arrData);
            // swap row/column header setting
            var t = this.firstRowIsHeader;
            this.firstRowIsHeader = this.firstColumnIsHeader;
            this.firstColumnIsHeader = t;
         }
         return parseDataArray(arrData, this.skipRows, this.emptyValue, this.firstRowIsHeader, this.firstColumnIsHeader);
      },

      guessDelimiter: function(strData) {
         // find delimiter which occurs most often
         var maxMatchCount = 0,
            k = -1,
            me = this,
            delimiters = ['\t',';','|',','];
         _.each(delimiters, function(delimiter, i) {
            var regex = me.getDelimiterPatterns(delimiter, me.quoteChar),
               c = strData.match(regex).length;
            if (c > maxMatchCount) {
               maxMatchCount = c;
               k = i;
            }
         });
         return delimiters[k];
      }

   });


}(this, _));