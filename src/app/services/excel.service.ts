import { Injectable, NgZone } from '@angular/core';
import { Subject } from 'rxjs/Subject';

declare const Office;
declare const Excel: any;

// Service for all Excel logic with Office.js API
// Documentation: https://dev.office.com/docs/add-ins/excel/excel-add-ins-javascript-programming-overview
@Injectable()
export class ExcelService {

    // Observables that allow the service to tell subscribing components
    // that the data in a binding has changed
    public inputParameterChange = new Subject<any>();
    public outputParameterChange = new Subject<any>();

    public inputParameterChanged$ = this.inputParameterChange.asObservable();
    public outputParameterChanged$ = this.outputParameterChange.asObservable();

    // Use NgZone to run the binding data change events
    // so that the Angular UI is forced to update
    // otherwise, it may run in a separate zone and not update
    constructor(private ngZone: NgZone) { }

    public changeInputParameter(eventArgs: any) {
        this.ngZone.run(() => {
            this.inputParameterChange.next(eventArgs.binding.id);
        })
    }

    public changeOutputParameter(eventArgs: any) {
        this.ngZone.run(() => {
            this.outputParameterChange.next(eventArgs.binding.id);
        })
    }

    // Creates a binding with the specified bindingName as the binding unique ID
    // Note: creates a matrix binding specifically because the new Office 2016 APIs
    // for getting a range from the binding are only compatible with this type of binding
    public bind(bindingName: string): Promise<any> {
        return new Promise((resolve, reject) => {
            Office.context.document.bindings.addFromPromptAsync(Office.BindingType.Matrix, { id: bindingName }, (result: any) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve(result.value);
                } else {
                    reject(result.error);
                }
            })
        })
    }

    // Adds a handler to the specified binding
    public addHandler(binding: any): Promise<string> {
        return new Promise((resolve, reject) => {
            binding.addHandlerAsync(Office.EventType.BindingDataChanged, this.changeInputParameter.bind(this), (result: any) => {
                if (result.status === Office.AsyncResultStatus.Succeeded) {
                    resolve('Created handler')
                } else {
                    reject(result.error);
                }
            })
        })
    }

    // Gets the value from the binding with the specified name
    public async getValue(name: string): Promise<any[][]> {
        try {
            return await Excel.run(async (context) => {
                const binding = context.workbook.bindings.getItem(name);
                const range = binding.getRange();
                range.load('values');

                await context.sync();

                return range.values;
            })
        } catch (error) {
            return error;
        }
    }

    // Sets the value(s) to the binding with the specified name
    public async setValues(name: string, values: any[][]) {
        try {
            return await Excel.run(async (context) => {
                const binding = context.workbook.bindings.getItem(name);
                const range = binding.getRange();
                range.values = values;

                return await context.sync();
            })
        } catch (error) {
            return error;
        }
    }

    // Sets the value(s) to the binding with the specified name in a flexible manner,
    // where the range will expand as needed to the size of the values
    public async setFlexValues(name: string, values: any[][]) {
        try {
            return await Excel.run(async (context) => {
                const binding = context.workbook.bindings.getItem(name);
                const boundRange = binding.getRange();
                const firstCell = boundRange.getCell(0, 0);
                const flexRange = firstCell.getResizedRange(values.length - 1, values[0].length - 1);
                flexRange.values = values;

                return await context.sync();
            })
        } catch (error) {
            return error;
        }
    }

    // Gets the range of cells in the specified binding
    public async getRange(name: string): Promise<string> {
        try {
            return await Excel.run(async (context) => {
                const binding = context.workbook.bindings.getItem(name);
                const range = binding.getRange();
                range.load('address');

                await context.sync()

                return range.address;
            })
        } catch (error) {
            return error;
        }
    }

}
