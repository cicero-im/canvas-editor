import {
  ControlType,
  ElementType,
  IElement,
  ListType,
  TitleLevel
} from './editor'

const text = `Chief Complaint:\nFever for three days, cough for five days.\nPresent Illness:\nThe patient developed facial edema without obvious inducement three days ago, after catching a cold. No rash, decreased urine output, and fatigue appeared. No improvement after treatment elsewhere, now comes to our hospital for treatment.\nPast History:\nDiabetes for 10 years, hypertension for 2 years, infectious disease for 1 year. Reports other past illnesses.\nEpidemiological History:\nDenies contact with confirmed cases, suspected cases, asymptomatic infected persons and their close contacts within 14 days; Denies going to the following places within 14 days: aquatic products, meat wholesale markets, farmers markets, markets, large supermarkets, night markets; Denies close contact with workers in the following places within 14 days: aquatic products, meat wholesale markets, farmers markets, markets, large supermarkets; Denies cluster onset in the surrounding area (such as family, office) within 14 days; Denies contact with people with fever or respiratory symptoms within 14 days; Denies having fever or respiratory symptoms within 14 days; Denies contact with persons under isolation observation within 14 days and other situations that may be associated with COVID-19; Accompanying family members have none of the above situations.\nPhysical Examination:\nT: 39.5°C, P: 80bpm, R: 20 times/min, BP: 120/80mmHg;\nAuxiliary Examination:\nJune 10, 2020, Radiology: Hematocrit 36.50% (low) 40-50; Absolute monocyte count 0.75*10/L (high) reference value: 0.1-0.6;\nOutpatient Diagnosis: Treatment Plan: Electronic Signature: []\nOther Records:`

// Mock titles
const titleText = [
  'Chief Complaint:',
  'Present Illness:',
  'Past History:',
  'Epidemiological History:',
  'Physical Examination:',
  'Auxiliary Examination:',
  'Outpatient Diagnosis:',
  'Treatment Plan:',
  'Electronic Signature:',
  'Other Records:'
]
const titleMap: Map<number, string> = new Map()
for (let t = 0; t < titleText.length; t++) {
  const value = titleText[t]
  const i = text.indexOf(value)
  if (~i) {
    titleMap.set(i, value)
  }
}

// Mock colored text
const colorText = ['infectious disease']
const colorIndex: number[] = colorText
  .map(b => {
    const i = text.indexOf(b)
    return ~i
      ? Array(b.length)
          .fill(i)
          .map((_, j) => i + j)
      : []
  })
  .flat()

// Mock highlighted text
const highlightText = ['Hematocrit']
const highlightIndex: number[] = highlightText
  .map(b => {
    const i = text.indexOf(b)
    return ~i
      ? Array(b.length)
          .fill(i)
          .map((_, j) => i + j)
      : []
  })
  .flat()

const elementList: IElement[] = []
// Combine plain text data
const textList = text.split('')
let index = 0
while (index < textList.length) {
  const value = textList[index]
  const title = titleMap.get(index)
  if (title) {
    elementList.push({
      value: '',
      type: ElementType.TITLE,
      level: TitleLevel.FIRST,
      valueList: [
        {
          value: title,
          size: 18
        }
      ]
    })
    index += title.length - 1
  } else if (colorIndex.includes(index)) {
    elementList.push({
      value,
      color: '#FF0000',
      size: 16
    })
  } else if (highlightIndex.includes(index)) {
    elementList.push({
      value,
      highlight: '#F2F27F',
      groupIds: ['1'] // Mock annotation
    })
  } else {
    elementList.push({
      value,
      size: 16
    })
  }
  index++
}

// Mock text control
elementList.splice(12, 0, {
  type: ElementType.CONTROL,
  value: '',
  control: {
    conceptId: '1',
    type: ControlType.TEXT,
    value: null,
    placeholder: 'Other supplements',
    prefix: '{',
    postfix: '}'
  }
})

// Mock dropdown control
elementList.splice(94, 0, {
  type: ElementType.CONTROL,
  value: '',
  control: {
    conceptId: '2',
    type: ControlType.SELECT,
    value: null,
    code: null,
    placeholder: 'Yes/No',
    prefix: '{',
    postfix: '}',
    valueSets: [
      {
        value: 'Yes',
        code: '98175'
      },
      {
        value: 'No',
        code: '98176'
      },
      {
        value: 'Unknown',
        code: '98177'
      }
    ]
  }
})

// Mock hyperlink
elementList.splice(116, 0, {
  type: ElementType.HYPERLINK,
  value: '',
  valueList: [
    {
      value: 'C',
      size: 16
    },
    {
      value: 'O',
      size: 16
    },
    {
      value: 'V',
      size: 16
    },
    {
      value: 'I',
      size: 16
    },
    {
      value: 'D',
      size: 16
    }
  ],
  url: 'https://hufe.club/canvas-editor'
})

// Mock text control (with pre and post text)
elementList.splice(335, 0, {
  type: ElementType.CONTROL,
  value: '',
  control: {
    conceptId: '6',
    type: ControlType.TEXT,
    value: null,
    placeholder: 'Content',
    preText: 'Other:',
    postText: '.'
  }
})

// Mock subscript
elementList.splice(346, 0, {
  value: '∆',
  color: '#FF0000',
  type: ElementType.SUBSCRIPT
})

// Mock superscript
elementList.splice(430, 0, {
  value: '9',
  type: ElementType.SUPERSCRIPT
})

// Mock list
elementList.splice(451, 0, {
  value: '',
  type: ElementType.LIST,
  listType: ListType.OL,
  valueList: [
    {
      value: 'Hypertension\nDiabetes\nViral cold\nAllergic rhinitis\nAllergic nasal polyps'
    }
  ]
})

elementList.splice(453, 0, {
  value: '',
  type: ElementType.LIST,
  listType: ListType.OL,
  valueList: [
    {
      value:
        'Ultrasound-guided thyroid fine needle aspiration;\nHepatitis B surface antibody determination;\nMembrane lesion cell collection, posterior neck subcutaneous layer;'
    }
  ]
})
