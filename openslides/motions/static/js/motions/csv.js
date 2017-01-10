(function () {

'use strict';

angular.module('OpenSlidesApp.motions.csv', [])

.factory('MotionCsvExport', [
    function () {
        return function (element, motions) {
            var csvRows = [
                ['identifier', 'title', 'text', 'reason', 'submitter', 'category', 'origin'],
            ];
            _.forEach(motions, function (motion) {
                var row = [];
                row.push('"' + motion.identifier + '"');
                row.push('"' + motion.getTitle() + '"');
                row.push('"' + motion.getText() + '"');
                row.push('"' + motion.getReason() + '"');
                var submitter = motion.submitters[0] ? motion.submitters[0].get_full_name() : '';
                row.push('"' + submitter + '"');
                var category = motion.category ? motion.category.name : '';
                row.push('"' + category + '"');
                row.push('"' + motion.origin + '"');
                csvRows.push(row);
            });

            var csvString = csvRows.join("%0A");
            element.href = 'data:text/csv;charset=utf-8,' + csvString;
            element.download = 'motions-export.csv';
            element.target = '_blank';
        };
    }
])

.factory('MotionListCsvExport', [
    'gettextCatalog',
    function (gettextCatalog) {
        return function (element, motions) {
            var headerline = ['Identifier', 'Title', 'Submitter', 'Recommendation', 'Motion block'];
            headerline = _.map(headerline, function (entry) {
                return gettextCatalog.getString(entry);
            });
            var csvRows = [];
            csvRows.push(headerline);
            _.forEach(motions, function (motion) {
                var row = [];
                row.push('"' + motion.identifier + '"');
                row.push('"' + motion.getTitle() + '"');
                var submitter = motion.submitters[0] ? motion.submitters[0].get_full_name() : '';
                row.push('"' + submitter + '"');
                row.push('"' + motion.getRecommendationName() + '"');
                var block = motion.motionBlock ? motion.motionBlock.name : '';
                row.push('"' + block + '"');
                csvRows.push(row);
            });

            var csvString = csvRows.join("%0A");
            element.href = 'data:text/csv;charset=utf-8,' + csvString;
            element.download = 'Aufrufliste.csv';
            element.target = '_blank';
        };
    }
]);

}());
