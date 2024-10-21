import { addReading, database, getReading, MetricTypes, Reading } from "../database"
import { isDate, isNaN, isNumber, keys, round } from 'lodash';
import moment from "moment";
import { getShortFormatDate } from "../utils/dateUtil";

function isMetricType(value: any): value is MetricTypes {
  return Object.values(MetricTypes).includes(value);
}

export const createMetric = (requestData: string): boolean => {

  const records = requestData.split('\n')
  const readings: Record<string, Reading[]> = {};

  for (const record of records) {
    const data = record.split(' ');
    if (data.length !== 3) {
      console.log('Invalid Data length: ', record)
      return false;
    }

    const time = parseInt(data[0]);
    const metric = data[1];
    const value = parseFloat(data[2]);

    if (isNaN(time) || !isMetricType(metric) || isNaN(value)) {
      console.log('Invalid Data: ', record)
      return false;
    }

    const date = getShortFormatDate(time);
    if (!readings[date])
      readings[date] = [];

    readings[date].push({
      timestamp: time,
      metric: metric,
      value: value
    })
  }

  keys(readings).forEach(date => {
    addReading(date, readings[date])
  })

  return true
}

enum ResponseMetricTypes {
  Voltage = "Voltage",
  Current = "Current",
  Power = "Power"
}

export interface ResponseReading {
  timestamp: string;
  metric: ResponseMetricTypes;
  value: number;
}

export const getMetrics = (from: string, to: string) => {
  const fromDate = moment(from, 'YYYY-MM-DD', true);
  const toDate = moment(to, 'YYYY-MM-DD', true);

  if (!fromDate.isValid() || !toDate.isValid() || fromDate.isAfter(toDate)) {
    throw new Error('Date Range is invalid');
  }

  // console.log("database-----------------------------", database)

  const result: ResponseReading[] = []
  for (let date = fromDate.clone(); date.isSameOrBefore(toDate); date.add(1, 'days')) {
    const records = getReading(date.format('YYYY-MM-DD'));

    if (!records)
      continue;

    const voltageRecords = records.filter(r => r.metric === MetricTypes.Voltage)
    const voltageAvg = voltageRecords.length > 0
      ? round(voltageRecords.reduce((p, c) => p + c.value, 0) / voltageRecords.length, 2)
      : 0;

    const currentRecords = records.filter(r => r.metric === MetricTypes.Current)
    const CurrentAvg = currentRecords.length > 0
      ? round(currentRecords.reduce((p, c) => p + c.value, 0) / currentRecords.length, 2)
      : 0

    result.push({
      timestamp: date.toISOString(),
      metric: ResponseMetricTypes.Voltage,
      value: voltageAvg
    }, {
      timestamp: date.toISOString(),
      metric: ResponseMetricTypes.Current,
      value: CurrentAvg
    }, {
      timestamp: date.toISOString(),
      metric: ResponseMetricTypes.Power,
      value: round(voltageAvg * CurrentAvg, 2)
    })
  }

  return result;

}