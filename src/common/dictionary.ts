function isValidKey(key: string | number | symbol, object: object): key is keyof typeof object {
    return key in object;
}

class Dictionary<T>{
    private _keys: Array<string>;
    private _values: Array<T>;

    constructor() {
        this._keys = new Array<string>();
        this._values = new Array<T>();
    }

    public static create<T>(): Dictionary<T> {
        return new Dictionary<T>();
    }

    public add(key: string, value: T): boolean {
        let index = this._keys.indexOf(key);
        if (index <= 0) {
            this._keys.push(key);
            this._values.push(value);
            return true;
        }
        return false;
    }


    public remove(key: string): void {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
        }
    }

    public containsKey(key: string): boolean {
        return this._keys.indexOf(key) >= 0;
    }

    public count(): number {
        return this._keys.length;
    }

    public item(key: string): T {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            return this._values[index];
        }
        return null as any;
    }

    public keys(): Array<string> {
        return this._keys;
    }

    public values(): Array<T> {
        return this._values;
    }

    public clear(): void {
        this._keys.length = 0;
        this._values.length = 0;
    }

    public forEach(callback: (key: string, value: T) => void): void {
        for (let i = 0; i < this._keys.length; i++) {
            callback(this._keys[i], this._values[i]);
        }
    }

    public toString(): string {
        let result = "";
        for (let i = 0; i < this._keys.length; i++) {
            result += this._keys[i] + ":" + this._values[i] + ";";
        }
        return result;
    }

    public toJson(): string {
        let result = "{";
        for (let i = 0; i < this._keys.length; i++) {
            result += "\"" + this._keys[i] + "\":\"" + this._values[i] + "\",";
        }
        result = result.substring(0, result.length - 1);
        result += "}";
        return result;
    }

    public fromJson(json: string): void {
        let obj = JSON.parse(json);
        for (let key in obj) {
            this.add(key, obj[key]);
        }
    }

    public fromString(str: string): void {
        let arr = str.split(";");
        for (let i = 0; i < arr.length; i++) {
            let item = arr[i].split(":");
            this.add(item[0], item[1] as any);
        }
    }

    public toArray(): Array<T> {
        let result = new Array<T>();
        for (let i = 0; i < this._keys.length; i++) {
            result.push(this._values[i]);
        }
        return result;
    }

    public fromArray(arr: Array<T>): void {
        this._keys.length = 0;
        this._values.length = 0;
        for (let i = 0; i < arr.length; i++) {
            this.add("" + i, arr[i]);
        }
    }

    public clone(): Dictionary<T> {
        let result = new Dictionary<T>();
        for (let i = 0; i < this._keys.length; i++) {
            result.add(this._keys[i], this._values[i]);
        }
        return result;
    }

    public toObject(): Object {
        let result: { [key: string]: T } = {};
        for (let i = 0; i < this._keys.length; i++) {
            result[this._keys[i]] = this._values[i];
        }
        return result;
    }

    public fromObject(obj: Object): void {
        this._keys.length = 0;
        this._values.length = 0;
        for (let key in obj) {
            isValidKey(key, obj) && this.add(key, obj[key]);
        }
    }

    public get(key: string): T {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            return this._values[index];
        }
        return null as any;
    }

    public set(key: string, value: T): boolean {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            this._values[index] = value;
            return true;
        }
        return false;
    }

    public setOrAdd(key: string, value: T): void {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            this._values[index] = value;
        }
        else {
            this.add(key, value);
        }
    }

    public has(key: string): boolean {
        return this._keys.indexOf(key) >= 0;
    }

    public delete(key: string): void {
        let index = this._keys.indexOf(key);
        if (index >= 0) {
            this._keys.splice(index, 1);
            this._values.splice(index, 1);
        }
    }

    public forEachKey(callback: (key: string) => void): void {
        for (let i = 0; i < this._keys.length; i++) {
            callback(this._keys[i]);
        }
    }


    public forEachValue(callback: (value: T) => void): void {
        for (let i = 0; i < this._values.length; i++) {
            callback(this._values[i]);
        }
    }

    public forEachKeyValue(callback: (key: string, value: T) => void): void {
        for (let i = 0; i < this._keys.length; i++) {
            callback(this._keys[i], this._values[i]);
        }
    }

    public forEachKeyValueReverse(callback: (key: string, value: T) => void): void {
        for (let i = this._keys.length - 1; i >= 0; i--) {
            callback(this._keys[i], this._values[i]);
        }
    }
}


export default Dictionary;