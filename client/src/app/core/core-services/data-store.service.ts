import { Injectable, EventEmitter } from '@angular/core';

import { Observable, Subject } from 'rxjs';

import { BaseModel, ModelConstructor } from '../../shared/models/base/base-model';
import { StorageService } from './storage.service';
import { CollectionStringMapperService } from './collection-string-mapper.service';
import { DataStoreUpdateManagerService } from './data-store-update-manager.service';

/**
 * Represents information about a deleted model.
 *
 * As the model doesn't exist anymore, just the former id and collection is known.
 */
export interface DeletedInformation {
    collection: string;
    id: number;
}

/**
 * represents a collection on the Django server, uses an ID to access a {@link BaseModel}.
 *
 * Part of {@link DataStoreService}
 */
interface ModelCollection {
    [id: number]: BaseModel;
}

/**
 * Represents a serialized collection.
 */
interface JsonCollection {
    [id: number]: string;
}

/**
 * The actual storage that stores collections, accessible by strings.
 *
 * {@link DataStoreService}
 */
interface ModelStorage {
    [collectionString: string]: ModelCollection;
}

/**
 * A storage of serialized collection elements.
 */
interface JsonStorage {
    [collectionString: string]: JsonCollection;
}

/**
 * All mighty DataStore that comes with all OpenSlides components.
 * Use this.DS in an OpenSlides Component to Access the store.
 * Used by a lot of components, classes and services.
 * Changes can be observed
 */
@Injectable({
    providedIn: 'root'
})
export class DataStoreService {
    private static cachePrefix = 'DS:';

    /** We will store the data twice: One as instances of the actual models in the _store
     * and one serialized version in the _serializedStore for the cache. Both should be updated in
     * all cases equal!
     */
    private modelStore: ModelStorage = {};
    private jsonStore: JsonStorage = {};

    /**
     * Subjects for changed elements (notified, even if there is a current update slot) for
     * a specific collection.
     */
    private changedSubjects: { [collection: string]: Subject<BaseModel> } = {};

    /**
     * Observable subject for changed or deleted models in the datastore.
     */
    private readonly modifiedSubject: Subject<void> = new Subject<void>();

    /**
     * Observe the datastore for changes and deletions.
     *
     * @return an observable for changed and deleted objects.
     */
    public get modifiedObservable(): Observable<void> {
        return this.modifiedSubject.asObservable();
    }

    /**
     * Observable subject for changed or deleted models in the datastore.
     */
    private readonly clearEvent: EventEmitter<void> = new EventEmitter<void>();

    /**
     * Observe the datastore for changes and deletions.
     *
     * @return an observable for changed and deleted objects.
     */
    public get clearObservable(): Observable<void> {
        return this.clearEvent.asObservable();
    }

    /**
     * The maximal change id from this DataStore.
     */
    private _maxChangeId = 0;

    /**
     * returns the maxChangeId of the DataStore.
     */
    public get maxChangeId(): number {
        return this._maxChangeId;
    }

    /**
     * @param storageService use StorageService to preserve the DataStore.
     * @param modelMapper
     * @param DSUpdateManager
     */
    public constructor(
        private storageService: StorageService,
        private modelMapper: CollectionStringMapperService,
        private DSUpdateManager: DataStoreUpdateManagerService
    ) {}

    /**
     * Get an model observable for models from a given collection. These observable will be notified,
     * even if there is an active update slot. So use this with caution (-> only collections with less models).
     *
     * @param collectionType The collection
     */
    public getChangeObservable<T extends BaseModel>(collectionType: ModelConstructor<T> | string): Observable<T> {
        const collection = this.getCollectionString(collectionType);
        if (!this.changedSubjects[collection]) {
            this.changedSubjects[collection] = new Subject();
        }
        return this.changedSubjects[collection].asObservable() as Observable<T>;
    }

    /**
     * Gets the DataStore from cache and instantiate all models out of the serialized version.
     * @returns The max change id.
     */
    public async initFromStorage(): Promise<number> {
        // This promise will be resolved with cached datastore.
        const store = await this.storageService.get<JsonStorage>(DataStoreService.cachePrefix + 'DS');
        if (store) {
            const updateSlot = await this.DSUpdateManager.getNewUpdateSlot(this);

            // There is a store. Deserialize it
            this.jsonStore = store;
            this.modelStore = this.deserializeJsonStore(this.jsonStore);

            // Get the maxChangeId from the cache
            let maxChangeId = await this.storageService.get<number>(DataStoreService.cachePrefix + 'maxChangeId');
            if (!maxChangeId) {
                maxChangeId = 0;
            }
            this._maxChangeId = maxChangeId;

            // update observers
            Object.keys(this.modelStore).forEach(collection => {
                Object.keys(this.modelStore[collection]).forEach(id => {
                    this.publishChangedInformation(this.modelStore[collection][id]);
                });
            });

            this.DSUpdateManager.commit(updateSlot);
        } else {
            await this.clear();
        }
        return this.maxChangeId;
    }

    /**
     * Deserialze the given serializedStorage and returns a Storage.
     * @param serializedStore The store to deserialize
     * @returns The serialized storage
     */
    private deserializeJsonStore(serializedStore: JsonStorage): ModelStorage {
        const storage: ModelStorage = {};
        Object.keys(serializedStore).forEach(collectionString => {
            storage[collectionString] = {} as ModelCollection;
            const target = this.modelMapper.getModelConstructor(collectionString);
            if (target) {
                Object.keys(serializedStore[collectionString]).forEach(id => {
                    const data = JSON.parse(serializedStore[collectionString][id]);
                    storage[collectionString][id] = new target(data);
                });
            }
        });
        return storage;
    }

    /**
     * Clears the complete DataStore and Cache.
     */
    public async clear(): Promise<void> {
        this.modelStore = {};
        this.jsonStore = {};
        this._maxChangeId = 0;
        await this.storageService.remove(DataStoreService.cachePrefix + 'DS');
        await this.storageService.remove(DataStoreService.cachePrefix + 'maxChangeId');
        this.clearEvent.next();
    }

    /**
     * Returns the collection _string_ based on the model given. If a string is given, it's just returned.
     * @param collectionType Either a Model constructor or a string.
     * @returns the collection string
     */
    private getCollectionString<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string): string {
        if (typeof collectionType === 'string') {
            return collectionType;
        } else {
            return this.modelMapper.getCollectionString(collectionType);
        }
    }

    /**
     * Read one model based on the collection and id from the DataStore.
     *
     * @param collectionType The desired BaseModel or collectionString to be read from the dataStore
     * @param ids One ID of the BaseModel
     * @return The given BaseModel-subclass instance
     * @example: this.DS.get(User, 1)
     * @example: this.DS.get<Countdown>('core/countdown', 2)
     */
    public get<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string, id: number): T {
        const collectionString = this.getCollectionString<T>(collectionType);

        const collection: ModelCollection = this.modelStore[collectionString];
        if (!collection) {
            return;
        } else {
            return collection[id] as T;
        }
    }

    /**
     * Read multiple ID's from dataStore.
     *
     * @param collectionType The desired BaseModel or collectionString to be read from the dataStore
     * @param ids Multiple IDs as a list of IDs of BaseModel
     * @return The BaseModel-list corresponding to the given ID(s)
     * @example: this.DS.getMany(User, [1,2,3,4,5])
     * @example: this.DS.getMany<User>('users/user', [1,2,3,4,5])
     */
    public getMany<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string, ids: number[]): T[] {
        const collectionString = this.getCollectionString<T>(collectionType);

        const collection: ModelCollection = this.modelStore[collectionString];
        if (!collection) {
            return [];
        }
        const models = ids
            .map(id => {
                return collection[id];
            })
            .filter(model => !!model); // remove non valid models.
        return models as T[];
    }

    /**
     * Get all models of the given collection from the DataStore.
     *
     * @param collectionType The desired BaseModel or collectionString to be read from the dataStore
     * @return The BaseModel-list of all instances of T
     * @example: this.DS.getAll(User)
     * @example: this.DS.getAll<User>('users/user')
     */
    public getAll<T extends BaseModel<T>>(collectionType: ModelConstructor<T> | string): T[] {
        const collectionString = this.getCollectionString<T>(collectionType);

        const collection: ModelCollection = this.modelStore[collectionString];
        if (!collection) {
            return [];
        } else {
            return Object.values(collection);
        }
    }

    /**
     * Filters the dataStore by type.
     *
     * @param collectionType The desired BaseModel type to be read from the dataStore
     * @param callback a filter function
     * @return The BaseModel-list corresponding to the filter function
     * @example this.DS.filter<User>(User, myUser => myUser.first_name === "Max")
     */
    public filter<T extends BaseModel<T>>(
        collectionType: ModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T[] {
        return this.getAll<T>(collectionType).filter(callback);
    }

    /**
     * Finds a model item in the dataStore by type.
     *
     * @param collectionType The desired BaseModel type to be read from the dataStore
     * @param callback a find function
     * @return The first BaseModel item matching the filter function
     * @example this.DS.find<User>(User, myUser => myUser.first_name === "Jenny")
     */
    public find<T extends BaseModel<T>>(
        collectionType: ModelConstructor<T> | string,
        callback: (model: T) => boolean
    ): T {
        return this.getAll<T>(collectionType).find(callback);
    }

    /**
     * Add one or multiple models to dataStore.
     *
     * @param models BaseModels to add to the store
     * @param changeId The changeId of this update. If given, the storage will be flushed to the
     * cache. Else one can call {@method flushToStorage} to do this manually.
     * @example this.DS.add([new User(1)])
     * @example this.DS.add([new User(2), new User(3)])
     * @example this.DS.add(arrayWithUsers, changeId)
     */
    public async add(models: BaseModel[], changeId?: number): Promise<void> {
        models.forEach(model => {
            const collection = model.collectionString;
            if (this.modelStore[collection] === undefined) {
                this.modelStore[collection] = {};
            }
            this.modelStore[collection][model.id] = model;

            if (this.jsonStore[collection] === undefined) {
                this.jsonStore[collection] = {};
            }
            this.jsonStore[collection][model.id] = JSON.stringify(model);
            this.publishChangedInformation(model);
        });
        if (changeId) {
            await this.flushToStorage(changeId);
        }
    }

    /**
     * removes one or multiple models from dataStore.
     *
     * @param collectionString The desired BaseModel type to be removed from the datastore
     * @param ids A list of IDs of BaseModels to remove from the datastore
     * @param changeId The changeId of this update. If given, the storage will be flushed to the
     * cache. Else one can call {@method flushToStorage} to do this manually.
     * @example this.DS.remove('users/user', [myUser.id, 3, 4])
     */
    public async remove(collectionString: string, ids: number[], changeId?: number): Promise<void> {
        ids.forEach(id => {
            if (this.modelStore[collectionString]) {
                delete this.modelStore[collectionString][id];
            }
            if (this.jsonStore[collectionString]) {
                delete this.jsonStore[collectionString][id];
            }
            this.publishDeletedInformation({
                collection: collectionString,
                id: id
            });
        });
        if (changeId) {
            await this.flushToStorage(changeId);
        }
    }

    /**
     * Resets the DataStore and set the given models as the new content.
     * @param models A list of models to set the DataStore to.
     * @param newMaxChangeId Optional. If given, the max change id will be updated
     * and the store flushed to the storage
     */
    public async set(models?: BaseModel[], newMaxChangeId?: number): Promise<void> {
        const modelStoreReference = this.modelStore;
        this.modelStore = {};
        this.jsonStore = {};
        // Inform about the deletion
        Object.keys(modelStoreReference).forEach(collectionString => {
            Object.keys(modelStoreReference[collectionString]).forEach(id => {
                this.publishDeletedInformation({
                    collection: collectionString,
                    id: +id // needs casting, because Objects.keys gives all keys as strings...
                });
            });
        });
        if (models && models.length) {
            await this.add(models, newMaxChangeId);
        }
    }

    /**
     * Informs the changed and changedOrDeleted subject about a change.
     *
     * @param model The model to publish
     */
    private publishChangedInformation(model: BaseModel): void {
        const slot = this.DSUpdateManager.getCurrentUpdateSlot();
        if (slot) {
            slot.addChangedModel(model.collectionString, model.id);
            // triggerModifiedObservable will be called by committing the update slot.
        } else {
            this.triggerModifiedObservable();
        }

        if (this.changedSubjects[model.collectionString]) {
            this.changedSubjects[model.collectionString].next(model);
        }
    }

    /**
     * Informs the deleted and changedOrDeleted subject about a deletion.
     *
     * @param information The information about the deleted model
     */
    private publishDeletedInformation(information: DeletedInformation): void {
        const slot = this.DSUpdateManager.getCurrentUpdateSlot();
        if (slot) {
            slot.addDeletedModel(information.collection, information.id);
            // triggerModifiedObservable will be called by committing the update slot.
        } else {
            this.triggerModifiedObservable();
        }
    }

    /**
     * Triggers the modified subject.
     */
    public triggerModifiedObservable(): void {
        this.modifiedSubject.next();
    }

    /**
     * Updates the cache by inserting the serialized DataStore. Also changes the chageId, if it's larger
     * @param changeId The changeId from the update. If it's the highest change id seen, it will be set into the cache.
     */
    public async flushToStorage(changeId: number): Promise<void> {
        this._maxChangeId = changeId;
        await this.storageService.set(DataStoreService.cachePrefix + 'DS', this.jsonStore);
        await this.storageService.set(DataStoreService.cachePrefix + 'maxChangeId', changeId);
    }
}
