import {Model} from '../_models/model';

export default class Utils {

  /**
   * Compares 2 strings char by char
   * <br>The result is -1 if a < b
   * <br>The result is 0 if a = b
   * <br>The result is 1 if a > b
   * @param a first string
   * @param b second string
   * @param ignoreCase allows to set the comparison case-sensitive
   * @param raiseError raise specific errors or not
   */
  static CompareStrings(a: any, b: any, ignoreCase: boolean = true, raiseError: boolean = false): number {
    if (!this.VerifyObject(a, raiseError)) {
      if (raiseError) {
        throw new Error('Util/CompareStrings value a is not a valid string');
      }
      a = '';
    }
    if (!this.VerifyObject(b, raiseError)) {
      if (raiseError) {
        throw new Error('Util/CompareStrings value b is not a valid string');
      }
      b = '';
    }

    if (ignoreCase) {
      a = a.toLocaleString().toLocaleUpperCase();
      b = b.toLocaleString().toLocaleUpperCase();
    }

    if (a < b) {
      return -1;
    }
    if (a > b) {
      return 1;
    }
    return 0;
  }

  /**
   * Compares 2 numbers
   * <br>The result is -1 if a < b
   * <br>The result is 0 if a = b
   * <br>The result is 1 if a > b
   * @param a first number
   * @param b second number
   * @param raiseError raise specific errors or not
   */
  static CompareNumbers(a: any, b: any, raiseError: boolean = false): number {
    if (!this.VerifyObject(a, raiseError)) {
      if (raiseError) {
        throw new Error('Util/CompareNumbers value a is not valid');
      }
    }
    if (!this.VerifyObject(b, raiseError)) {
      if (raiseError) {
        throw new Error('Util/CompareNumbers value b is not valid');
      }
    }
    return a - b;
  }

  /**
   * Compares 2 dates given as string with the format yyyy-mm-dd
   * <br>The result is -1 if a < b
   * <br>The result is 0 if a = b
   * <br>The result is 1 if a > b
   * @param a first date
   * @param b second date
   * @param raiseError raise specific errors or not
   */
  static CompareDate(a: any, b: any, raiseError: boolean = false): number {
    if (!this.VerifyObject(a, raiseError)) {
      a = '1900-01-01';
      if (raiseError) {
        throw new Error('Util/CompareDate date a is not valid');
      }
    }
    if (!this.VerifyObject(b, raiseError)) {
      b = '1900-01-02';
      if (raiseError) {
        throw new Error('Util/CompareDate date b is not valid');
      }
    }

    const splitA = (a as string).split('-');
    const date1 = new Date(+splitA[0], +splitA[1], +splitA[2]);
    const splitB = (b as string).split('-');
    const date2 = new Date(+splitB[0], +splitB[1], +splitB[2]);
    if (date1 > date2) {
      return 1;
    } else if (date1 < date2) {
      return -1;
    } else {
      return 0;
    }
  }

  /**
   * Comparator for model objects which can be used to sort models by their version while
   * grouping them by their project id and model group.
   * <br>The result is -1 if a < b
   * <br>The result is 0 if a = b
   * <br>The result is 1 if a > b
   * @param a the first model
   * @param b the second model
   */
  static compareModels(a: Model, b: Model): number {
    const projectComparision = a.projectId - b.projectId;
    if (projectComparision === 0) {
      const groupA = a.modelMetadata.modelGroup.modelGroupName;
      const groupB = b.modelMetadata.modelGroup.modelGroupName;
      if (groupA > groupB) {
        return 1;
      } else if (groupA < groupB) {
        return -1;
      } else {
        return Number(a.modelMetadata.version) - Number(b.modelMetadata.version);
      }
    } else {
      return projectComparision;
    }
  }

  /**
   * Verifies the given object against existence, null and undefined
   * @param a the object to verify
   * @param raiseError raise specific errors or not
   */
  static VerifyObject(a: any, raiseError: boolean = false): boolean {
    let valid = true;
    if (!a) {
      if (raiseError) {
        throw new Error('Utils/VerifyObject value missing');
      }
      valid = false;
    } else if (a === undefined) {
      if (raiseError) {
        throw new Error('Utils/VerifyObject value undefined');
      }
      valid = false;
    } else if (a === null) {
      if (raiseError) {
        throw new Error('Utils/VerifyObject value null');
      }
      valid = false;
    }
    return valid;
  }

  /**
   * Recursive search through the given object until simple types are given.
   * Comparison is case-insensitive.
   * @param obj the object to iterate through
   * @param filter the string to look for
   * @param printLog print debug or not
   */
  static searchFilterRecursive(obj: any, filter: string, printLog: boolean = false): boolean {
    if (printLog) {
      console.log('analyse object');
      console.log(obj);
    }
    if (!Utils.VerifyObject(obj)) {
      if (printLog) {
        console.log('verify object');
        console.log(false);
      }
      return false;
    }

    if (typeof obj !== 'object') {
      if (printLog) {
        console.log('typeof object');
        console.log(typeof obj);
      }
      return Utils.containsFilter(obj, filter, printLog);
    }

    const properties = Object.values(obj);
    for (let i = 0; i < properties.length; i++) {
      if (Utils.searchFilterRecursive(properties[i], filter, printLog)) {
        return true;
      }
    }

    if (printLog) {
      console.log('last resort');
      console.log(false);
    }
    return false;
  }

  /**
   * Searches the given filter within the object.
   * The comparison is case-insensitive.
   * @param info the object to analyse
   * @param filter the string to look for
   * @param printLog print debug or not
   */
  static containsFilter(info: any, filter: string, printLog: boolean = false): boolean {
    let infoString = info;
    if (typeof info !== 'string') {
      infoString = info.toString();
    }
    const result = infoString.toLocaleUpperCase().search(filter.toLocaleUpperCase()) >= 0;
    if (printLog) {
      console.log('containsFilter result');
      console.log(result);
    }
    return result;
  }

  /**
   * Formates the number of bytes into a string representation of the highest unit.
   * @param bytes to be formatted
   * @return string representation of the bytes with unit identifier
   */
  static formatBytes(bytes: number): String {
    if (bytes === 0) {
      return '0 Bytes';
    }
    const k = 1024,
      dm = 2, // only one decimal place
      sizes = ['Bytes', 'KB', 'MB', 'GB'],
      i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
  }

  static notEmptyOrNull(list): boolean {
    return list && list.length > 0;
  }

  /**
   * Typescript doesn't provide a native way to create a deep copy of an object.
   * Therefore, we need this utility method to get rid of any references of nested objects.
   * @param objectToCopy
   * @return deep copy of the provided object
   */
  static createCopy<T>(objectToCopy: T): T {
    return (JSON.parse(JSON.stringify(objectToCopy)));
  }

}
