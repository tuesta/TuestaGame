export class CircularArray<T> {
    private data: Array<T>;
    private head: number;
    private count: number;

    constructor(length: number, el?: T, def?: T) {
        const buffer = def ? new Array(length).fill(def) : new Array(length);
        this.data = buffer;
        this.head = 0;
        this.count = 0;

        if (el) {this.insert(el)};
    }

    public insert(el: T): void {
        this.data[this.head] = el;
        this.head = (this.head + 1) % this.data.length;

        if (this.count < this.data.length) {
            this.count++;
        }
    }

    public getAt(index: number): T {return this.data[index];}

    private gets(order: "latest_to_oldest" | "oldest_to_latest", length?: number): Array<T> {
        let length_ = Math.min(length || this.count, this.count);

        const lasts: Array<T> = new Array(length_);
        let i = 0;

        this.traverseBuffer(el => {
            lasts[i] = el;
            i++;
        }, length_, order)

        return lasts;
    }

    public getLasts(length?: number): Array<T> {return this.gets("latest_to_oldest", length)}
    public getFirsts(length?: number): Array<T> {return this.gets("oldest_to_latest", length)}

    public getLast(): T {return this.getLasts(1)[0];}
    public getFirst(): T {return this.getFirsts(1)[0];}

    public traverseBuffer( f : (el: T) => void
                          , lastN?: number
                          , order: "latest_to_oldest" | "oldest_to_latest" = "latest_to_oldest"
                          ): void {
        const limit = Math.min(lastN ?? this.count, this.count);
        if (limit === 0) return;


        if (order === "latest_to_oldest") {
            const start
                = this.count < this.data.length
                ? Math.max(0, this.count - limit)
                : (this.head - limit + this.data.length) % this.data.length;

            for (let i = limit - 1; i >= 0; i--) {
                const index = (start + i) % this.data.length;
                f(this.data[index]);
            }
        } else {
            const start = this.count < this.data.length ? 0 : this.head;

            for (let i = 0; i < limit; i++) {
                const index = (start + i) % this.data.length;
                f(this.data[index]);
            }
        }
    }

    public length(): number {return this.count;}
}
