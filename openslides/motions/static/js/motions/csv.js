(function () {

'use strict';

angular.module('OpenSlidesApp.motions.csv', [])

.factory('MotionCsvExport', [
    '$filter',
    'gettextCatalog',
    'Config',
    'CsvDownload',
    'lineNumberingService',
    function ($filter, gettextCatalog, Config, CsvDownload, lineNumberingService) {
        var makeHeaderline = function (params) {
            var headerline = ['Identifier', 'Title'];
            if (params.include.text) {
                headerline.push('Text');
            }
            if (params.include.reason) {
                headerline.push('Reason');
            }
            if (params.include.submitters) {
                headerline.push('Submitter');
            }
            headerline.push('Category');
            if (params.include.origin) {
                headerline.push('Origin');
            }
            if (params.include.motionBlock) {
                headerline.push('Motion block');
            }
            if (params.include.recommendation) {
                headerline.push('Recommendation');
            }
            return _.map(headerline, function (entry) {
                return gettextCatalog.getString(entry);
            });
        };
        return {
            export: function (motions, params) {
                if (!params) {
                    params = {};
                }
                _.defaults(params, {
                    changeRecommendationMode: Config.get('motions_recommendation_text_mode').value,
                    include: {
                        text: true,
                        reason: true,
                        submitters: true,
                        origin: true,
                        motionBlock: true,
                        state: true,
                        recommendation: true,
                    },
                });
                params.filename = gettextCatalog.getString('motions') + '.csv';
                if (!_.includes(['original', 'changed', 'agreed'], params.changeRecommendationMode)) {
                    params.changeRecommendationMode = 'original';
                }

                var csvRows = [
                    makeHeaderline(params)
                ];
                _.forEach(motions, function (motion) {
                    var text = motion.getTextByMode(params.changeRecommendationMode, null, null, false);
                    var row = [];
                    // Identifier and title
                    row.push('"' + motion.identifier !== null ? motion.identifier : '' + '"');
                    row.push('"' + motion.getTitle() + '"');

                    // Text
                    if (params.include.text) {
                        row.push('"' + text + '"');
                    }

                    // Reason
                    if (params.include.reason) {
                        row.push('"' + motion.getReason() + '"');
                    }

                    // Submitters
                    if (params.include.submitters) {
                        var submitters = [];
                        _.forEach($filter('orderBy')(motion.submitters, 'weight'), function (user) {
                            var user_short_name = [
                                user.user.title,
                                user.user.first_name,
                                user.user.last_name
                            ].join(' ').trim();
                            submitters.push(user_short_name);
                        });
                        row.push('"' + submitters.join('; ') + '"');
                    }

                    // Category
                    var category = motion.category ? motion.category.name : '';
                    row.push('"' + category + '"');

                    // Origin
                    if (params.include.origin) {
                        row.push('"' + motion.origin + '"');
                    }

                    // Motion block
                    if (params.include.motionBlock) {
                        var blockTitle = motion.motionBlock ? motion.motionBlock.title : '';
                        row.push('"' + blockTitle + '"');
                    }

                    // Recommendation
                    if (params.include.recommendation) {
                        var recommendation = motion.recommendation ? motion.getRecommendationName() : '';
                        row.push('"' + recommendation + '"');
                    }
                    csvRows.push(row);
                });
                CsvDownload(csvRows, params.filename);
            },
            downloadExample: function () {
                var csvRows = [makeHeaderline({ include: {
                        text: true,
                        reason: true,
                        submitters: true,
                        origin: true,
                        motionBlock: true,
                        state: true,
                        recommendation: true,
                    }}),
                    // example entries
                    ['A1', 'Title 1', 'Text 1', 'Reason 1', 'Submitter A', 'Category A', 'Last Year Conference A', 'Block A'],
                    ['B1', 'Title 2', 'Text 2', 'Reason 2', 'Submitter B', 'Category B', '', 'Block A'],
                    [''  , 'Title 3', 'Text 3', '', '', '', '', ''],
                ];
                CsvDownload(csvRows, gettextCatalog.getString('motions-example') + '.csv');
            },
        };
    }
])

.factory('AmendmentCsvExport', [
    '$filter',
    'gettextCatalog',
    'CsvDownload',
    'lineNumberingService',
    function ($filter, gettextCatalog, CsvDownload, lineNumberingService) {
        var makeHeaderline = function () {
            var headerline = ['Identifier', 'Submitters', 'Category', 'Motion block',
                'Leadmotion', 'Line', 'Old text', 'New text', 'Recommendation'];
            return _.map(headerline, function (entry) {
                return gettextCatalog.getString(entry);
            });
        };
        return {
            export: function (amendments) {
                var csvRows = [
                    makeHeaderline()
                ];
                _.forEach(amendments, function (amendment) {
                    var row = [];
                    // Identifier
                    row.push('"' + amendment.identifier !== null ? amendment.identifier : '' + '"');

                    // Submitters
                    var submitters = [];
                    _.forEach($filter('orderBy')(amendment.submitters, 'weight'), function (user) {
                        var user_short_name = [
                            user.user.title,
                            user.user.first_name,
                            user.user.last_name
                        ].join(' ').trim();
                        submitters.push(user_short_name);
                    });
                    row.push('"' + submitters.join('; ') + '"');

                    // Category
                    var category = amendment.category ? amendment.category.name : '';
                    row.push('"' + category + '"');

                    // Motion block
                    var blockTitle = amendment.motionBlock ? amendment.motionBlock.title : '';
                    row.push('"' + blockTitle + '"');

                    // Lead motion
                    var leadmotion = amendment.getParentMotion();
                    if (leadmotion) {
                        var leadmotionTitle = leadmotion.identifier ? leadmotion.identifier + ': ' : '';
                        leadmotionTitle += leadmotion.getTitle();
                        row.push('"' + leadmotionTitle + '"');
                    } else {
                        row.push('""');
                    }

                    // changed paragraph
                    if (amendment.isParagraphBasedAmendment()) {
                        // TODO: get old and new paragraphLine. Resolve todo
                        // in motion.getAmendmentParagraphsLinesByMode
                        var p_old = amendment.getAmendmentParagraphsLinesByMode('original', null, false)[0];
                        //var p_new = amendment.getAmendmentParagraphsLinesByMode('changed', null, false)[0];
                        var lineStr = p_old.diffLineFrom;
                        if (p_old.diffLineTo != p_old.diffLineFrom + 1) {
                            lineStr += '-' + p_old.diffLineTo;
                        }
                        row.push('"' + lineStr + '"');
                        //row.push('"' + p_old.text.html + '"');
                        //row.push('"' + p_new.text.html + '"');

                        // Work around: Export the full paragraphs instead of changed lines
                        // Remove all HTML tags from old and new text
                        var oldText = document.createElement("DIV");
                        oldText.innerHTML =  amendment.getAmendmentParagraphsByMode('original', null, false)[0].text;
                        var newText = document.createElement("DIV");
                        newText.innerHTML =  amendment.getAmendmentParagraphsByMode('changed', null, false)[0].text;
                        row.push('"' + (oldText.textContent || oldText.innerText) + '"');
                        row.push('"' + (newText.textContent || newText.innerText) + '"');
                    } else {
                        row.push('""');
                        row.push('""');
                        row.push('"' + amendment.getText() + '"');
                    }

                    // Recommendation
                    var recommendation = amendment.recommendation ? amendment.getRecommendationName() : '';
                    row.push('"' + recommendation + '"');

                    csvRows.push(row);
                });
                CsvDownload(csvRows, 'amendments-export.csv');
            },
        };
    }
])

// Custom csv export: "Aufrufliste"
.factory('MotionListCsvExport', [
    'gettextCatalog',
    'Config',
    'CsvDownload',
    function (gettextCatalog, Config, CsvDownload) {
        var makeHeaderline = function () {
            var recommendation = Config.get('motions_recommendations_by').value;
            // CUSTOM: added last field "Lft. Nr." which is ignored by import
            var headerline = ['Identifier', 'Lfd. Nr.', 'Submitter', 'Title', recommendation, 'Motion block'];
            return _.map(headerline, function (entry) {
                return gettextCatalog.getString(entry);
            });
        };
        return {
            export: function (motions, params) {
                if (!params) {
                    params = {};
                }
                _.defaults(params, {
                    filename: 'motions-export.csv',
                    changeRecommendationMode: Config.get('motions_recommendation_text_mode').value,
                    includeReason: true,
                });
                if (!_.includes(['original', 'changed', 'agreed'], params.changeRecommendationMode)) {
                    params.changeRecommendationMode = 'original';
                }

                var csvRows = [
                    makeHeaderline()
                ];
                _.forEach(motions, function (motion) {
                    var row = [];
                    row.push('"' + motion.identifier !== null ? motion.identifier : '' + '"');
                    row.push('"' + motion.id + '"');
                    // submitters
                    var submitters = [];
                    angular.forEach(motion.submitters, function(user) {
                        var user_short_name = [user.title, user.first_name, user.last_name].join(' ').trim();
                        submitters.push(user_short_name);
                    });
                    row.push('"' + submitters.join('; ') + '"');
                    row.push('"' + motion.getTitle() + '"');
                    row.push('"' + motion.getRecommendationName() + '"');
                    var block = motion.motionBlock ? motion.motionBlock.title : '';
                    row.push('"' + block + '"');
                    csvRows.push(row);
                });
                CsvDownload(csvRows, 'Aufrufliste.csv');
            }
        };
    }
]);

}());
