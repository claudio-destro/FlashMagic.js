import {InSystemProgramming} from './InSystemProgramming';

const SYNCHRONIZED = 'Synchronized';

function handshake(isp: InSystemProgramming, frequency: number, count: number): Promise<InSystemProgramming> {
  let freq = frequency.toString(10);
  return new Promise<InSystemProgramming>((resolve, reject) => {
    (function synchronize() {
      isp.write('?')
        .then(() => isp.read(20))
        .then(ack => {
          if (ack !== SYNCHRONIZED) {
            throw new RangeError('Not synchronized');
          }
          return isp.writeln(SYNCHRONIZED);
        })
        .then(() => isp.assert(SYNCHRONIZED))
        .then(ack => isp.assert('OK'))
        .then(() => isp.writeln(freq))
        .then(() => isp.assert(freq))
        .then(ack => isp.assert('OK'))
        .then(() => resolve(isp))
        .catch(error => {
          if (count-- <= 0) {
            return reject(error);
          } else {
            // console.warn(error);
            setImmediate(synchronize);
          }
        });
    })();
  });
}

export function open(path: string, baud: number = 9600, frequency: number = 12000000): Promise<InSystemProgramming> {
	return new InSystemProgramming(path, baud)
      .open()
      .then(isp => handshake(isp, frequency / 1000, 1000));
      //.then(isp => isp.setBaudRate(baud))
      //.then(isp => isp.unlock());
}