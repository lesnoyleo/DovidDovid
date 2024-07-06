import { Injectable } from '@angular/core';
import { utils, WorkSheet, writeFile } from 'xlsx-js-style';
import { ExcelInfoRow } from '../interface/generatedDestination';
import { PROXY_TYPE } from '../constants/proxyTypeIds';
import {
  USER_AGENT_MOBILE_DATA,
  USER_AGENT_RESIDENTAL_DATA,
} from '../constants/userAgentColum.constant';
import { Subject } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class XlsxjsService {
  public excelFileGenerateFinish = new Subject<void>();

  public setFirstRowStyles(workSheet: WorkSheet): void {
    const alph = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    for (let letter of alph) {
      workSheet[`${letter}1`].s = {
        fill: { fgColor: { rgb: 'FFFF00' } },
        font: { name: 'calibri', color: { rgb: '000000' }, sz: 18, bold: true },
        alignment: {
          vertical: 'center',
          horizontal: 'center',
        },
        border: {
          right: {
            style: 'thin',
            color: '000000',
          },
          left: {
            style: 'thin',
            color: '000000',
          },
          top: {
            style: 'thin',
            color: '000000',
          },
          bottom: {
            style: 'thin',
            color: '000000',
          },
        },
      };
    }
  }

  public setAllRowsSizes(
    workSheet: WorkSheet,
    countRows: number,
    countCols: number
  ): void {
    const hRows = [];
    for (let index = 0; index < countRows; index++) {
      hRows.push({ hpx: 40 });
    }
    const hCols = [];
    for (let index = 0; index < countCols; index++) {
      hCols.push({ wpx: 250 });
    }
    workSheet['!rows'] = hRows;
    workSheet['!cols'] = hCols;
  }

  public setAllCellsStyle(workSheet: WorkSheet, countRows: number): void {
    const alph = ['A', 'B', 'C', 'D', 'E', 'F', 'G'];
    for (let index = 2; index < countRows + 1; index++) {
      for (let letter of alph) {
        workSheet[`${letter}${index}`].s = {
          font: {
            name: 'calibri',
            color: { rgb: '000000' },
            sz: 11,
          },
          alignment: {
            vertical: 'center',
            horizontal: 'center',
            wrapText: true,
          },
        };
      }
    }
  }

  public generateExcelFile(excelInfoRows: ExcelInfoRow[]): void {
    var headerData = [
      [
        'Profile name (Имя профиля)',
        'Cookie',
        'Proxy type (Тип прокси)',
        'Proxy (Данные прокси)',
        'Proxy Name (Имя прокси)',
        'User Agent',
        'Notes (Заметка)',
      ],
    ];

    const data = [...headerData];

    for (let index = 0; index < excelInfoRows.length; index++) {
      const combinedExcelRow = [];
      combinedExcelRow.push((index + 1).toString());
      combinedExcelRow.push('');
      combinedExcelRow.push('http');
      combinedExcelRow.push(excelInfoRows[index].value);
      combinedExcelRow.push('');
      combinedExcelRow.push(
        excelInfoRows[index].proxyType === PROXY_TYPE.MOBILE
          ? USER_AGENT_MOBILE_DATA
          : USER_AGENT_RESIDENTAL_DATA
      );
      combinedExcelRow.push('');
      data.push(combinedExcelRow);
    }

    var workbook = utils.book_new();
    workbook.SheetNames.push('First');
    workbook.Sheets['First'] = utils.aoa_to_sheet(data);
    let firstSheet = workbook.Sheets['First'];

    this.setFirstRowStyles(firstSheet);
    this.setAllRowsSizes(firstSheet, data.length, data[0].length);
    this.setAllCellsStyle(firstSheet, data.length);

    writeFile(workbook, 'idi naxyi^ sam sdelai down.xlsx');

    this.excelFileGenerateFinish.next();
  }
}
