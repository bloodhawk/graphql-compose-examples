/* @flow */

import mongoose from 'mongoose';
import { composeWithMongooseDiscriminators } from 'graphql-compose-mongoose';
import { type ObjectTypeComposer } from 'graphql-compose';
import { schemaComposer, type TContext } from './schemaComposer';

// pick a discriminatorKey
const DKey = 'type';

const enumCharacterType = {
  PERSON: 'Person',
  DROID: 'Droid',
};

// DEFINE BASE SCHEMA
const CharacterSchema = new mongoose.Schema(
  {
    // _id: field...
    type: {
      type: String,
      require: true,
      enum: (Object.keys(enumCharacterType): Array<string>),
      description: 'Character type Droid or Person',
    },

    name: String,
    height: Number,
    mass: Number,
    films: [String],
    aNestedField: {
      anotherGenericNestedField: String,
    },
  },
  {
    collection: 'md_characters',
  }
);

// DEFINE DISCRIMINATOR SCHEMAS
const DroidSchema = new mongoose.Schema({
  makeDate: String,
  primaryFunction: [String],
  aNestedField: {
    aDroidNestedField: String,
  },
});

const PersonSchema = new mongoose.Schema({
  gender: String,
  hairColor: String,
  starships: [String],
  aNestedField: {
    aPersonNestedField: String,
  },
});

// set discriminator Key
CharacterSchema.set('discriminatorKey', DKey);

// create base Model
export const CharacterModel = mongoose.model('Character', CharacterSchema);

// create mongoose discriminator models
export const DroidModel = CharacterModel.discriminator(enumCharacterType.DROID, DroidSchema);
export const PersonModel = CharacterModel.discriminator(enumCharacterType.PERSON, PersonSchema);

export const CharacterDTC = composeWithMongooseDiscriminators<any, TContext>(CharacterModel, {
  schemaComposer,
});

type DroidT = any;
export const DroidTC: ObjectTypeComposer<DroidT, TContext> = CharacterDTC.discriminator<DroidT>(
  DroidModel
);

type PersonT = any;
export const PersonTC: ObjectTypeComposer<PersonT, TContext> = CharacterDTC.discriminator<PersonT>(
  PersonModel
);
