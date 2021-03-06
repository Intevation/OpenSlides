import { Injectable } from '@angular/core';

import { Workbook } from 'exceljs/dist/exceljs.min.js';

import { InfoToExport } from './motion-pdf.service';
import { sortMotionPropertyList } from '../motion-import-export-order';
import { MotionRepositoryService } from 'app/core/repositories/motions/motion-repository.service';
import { TranslateService } from '@ngx-translate/core';
import { ViewMotion } from '../models/view-motion';
import { XlsxExportServiceService, CellFillingDefinition } from 'app/core/ui-services/xlsx-export-service.service';

/**
 * Service to export motion elements to XLSX
 */
@Injectable({
    providedIn: 'root'
})
export class MotionXlsxExportService {
    /**
     * Determine the default font size
     */
    private fontSize = 12;

    /**
     * The defa
     */
    private fontName = 'Arial';

    /**
     * Defines the head row style
     */
    private headRowFilling: CellFillingDefinition = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: 'FFFFE699'
        },
        bgColor: {
            argb: 'FFFFE699'
        }
    };

    /**
     * Filling Style of odd rows
     */
    private oddFilling: CellFillingDefinition = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: {
            argb: 'FFDDDDDD'
        },
        bgColor: {
            argb: 'FFDDDDDD'
        }
    };

    /**
     * Constructor
     *
     * @param xlsx XlsxExportServiceService
     * @param translate translationService
     * @param motionRepo MotionRepositoryService
     */
    public constructor(
        private xlsx: XlsxExportServiceService,
        private translate: TranslateService,
        private motionRepo: MotionRepositoryService
    ) {}

    /**
     * Export motions as XLSX
     *
     * @param motions
     * @param contentToExport
     * @param infoToExport
     */
    public exportMotionList(motions: ViewMotion[], infoToExport: InfoToExport[]): void {
        const workbook = new Workbook();
        const properties = sortMotionPropertyList(['identifier', 'title'].concat(infoToExport));

        const worksheet = workbook.addWorksheet(this.translate.instant('Motions'), {
            pageSetup: {
                paperSize: 9,
                orientation: 'landscape',
                fitToPage: true,
                fitToHeight: 5,
                fitToWidth: properties.length,
                printTitlesRow: '1:1',
                margins: {
                    left: 0.4,
                    right: 0.4,
                    top: 1.0,
                    bottom: 0.5,
                    header: 0.3,
                    footer: 0.3
                }
            }
        });

        worksheet.columns = properties.map(property => {
            const propertyHeader =
                property === 'motion_block'
                    ? 'Motion block'
                    : property.charAt(0).toLocaleUpperCase() + property.slice(1);
            return {
                header: this.translate.instant(propertyHeader)
            };
        });

        worksheet.getRow(1).eachCell(cell => {
            cell.font = {
                name: this.fontName,
                size: this.fontSize,
                underline: true,
                bold: true
            };
            cell.fill = this.headRowFilling;
        });

        // map motion data to properties
        const motionData = motions.map(motion =>
            properties.map(property => {
                const motionProp = motion[property];
                if (motionProp) {
                    switch (property) {
                        case 'state':
                            return this.motionRepo.getExtendedStateLabel(motion);
                        case 'recommendation':
                            return this.motionRepo.getExtendedRecommendationLabel(motion);
                        default:
                            return this.translate.instant(motionProp.toString());
                    }
                } else {
                    return '';
                }
            })
        );

        // add to sheet
        for (let i = 0; i < motionData.length; i++) {
            const row = worksheet.addRow(motionData[i]);
            row.eachCell(cell => {
                cell.alignment = { vertical: 'middle', horizontal: 'left', wrapText: true };
                cell.font = {
                    name: this.fontName,
                    size: this.fontSize
                };
                // zebra styled filling
                if (i % 2 !== 0) {
                    cell.fill = this.oddFilling;
                }
            });
        }

        this.xlsx.autoSize(worksheet, 0);
        this.xlsx.saveXlsx(workbook, this.translate.instant('Motions'));
    }
}
