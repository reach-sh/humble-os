// Automatically generated with Reach 0.1.8 (4bfdf20d)
/* eslint-disable */
export const _version = '0.1.8';
export const _versionHash = '0.1.8 (4bfdf20d)';
export const _backendVersion = 9;

export function getExports(s) {
  const stdlib = s.reachStdlib;
  const ctc0 = stdlib.T_UInt;
  const ctc1 = stdlib.T_Object({
    fee: ctc0,
    lpFee: ctc0,
    totFee: ctc0
    });
  const ctc2 = stdlib.T_Address;
  const ctc3 = stdlib.T_Object({
    addr: ctc2,
    fee: ctc0,
    lpFee: ctc0,
    totFee: ctc0
    });
  return {
    ERR_CHKADD_1: (() => {
      
      const v56 = 'add overflow                                                    ';
      
      return v56;})(),
    ERR_CHKMUL_1: (() => {
      
      const v57 = 'denom > 0                                                       ';
      
      return v57;})(),
    ERR_CHKMUL_2: (() => {
      
      const v58 = 'mul overflow                                                    ';
      
      return v58;})(),
    ERR_CHKSUB_1: (() => {
      
      const v59 = 'a >= b                                                          ';
      
      return v59;})(),
    ERR_DOAVG_1: (() => {
      
      const v60 = 'balA > 0                                                        ';
      
      return v60;})(),
    ERR_DOAVG_2: (() => {
      
      const v61 = 'balB > 0                                                        ';
      
      return v61;})(),
    ERR_DOAVG_3: (() => {
      
      const v62 = 'result <= poolBalance                                           ';
      
      return v62;})(),
    ERR_HARVESTER_ADDR1: (() => {
      
      const v63 = 'Thou art not the harvester                                      ';
      
      return v63;})(),
    ERR_VERIFY_SQRT_1: (() => {
      
      const v64 = 'minted > 0                                                      ';
      
      return v64;})(),
    ERR_VERIFY_SQRT_2: (() => {
      
      const v65 = 'muldiv(amtA, amtB, minted) >= minted                            ';
      
      return v65;})(),
    ERR_VERIFY_SQRT_3: (() => {
      
      const v66 = 'minted <= poolBalance                                           ';
      
      return v66;})(),
    NUM_OF_TOKENS: (() => {
      
      
      return stdlib.checkedBigNumberify('./util.rsh:51:30:decimal', stdlib.UInt_max, 2);})(),
    VERIFY_ARITH: (() => {
      
      
      return false;})(),
    chkAddView: ((_v67, _v68 ) => {
        const v67 = stdlib.protect(ctc0, _v67, null);
        const v68 = stdlib.protect(ctc0, _v68, null);
      
      const v72 = stdlib.sub(stdlib.UInt_max, v67);
      const v73 = stdlib.ge(v72, v68);
      stdlib.assert(v73, {
        at: './util.rsh:14:4:application',
        fs: ['at 18:54:application call to [unknown function] (defined at: ./util.rsh:12:57:function exp)', 'at <top level> call to "chkAddView" (defined at: <top level>)'],
        msg: 'add overflow                                                    ',
        who: 'Module'
        });
      const v74 = stdlib.add(v67, v68);
      
      return v74;}),
    chkMulView: ((_v75, _v76 ) => {
        const v75 = stdlib.protect(ctc0, _v75, null);
        const v76 = stdlib.protect(ctc0, _v76, null);
      
      const v80 = stdlib.gt(v76, stdlib.checkedBigNumberify('./util.rsh:27:9:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v80, {
        at: './util.rsh:27:4:application',
        fs: ['at 32:54:application call to [unknown function] (defined at: ./util.rsh:26:57:function exp)', 'at <top level> call to "chkMulView" (defined at: <top level>)'],
        msg: 'denom > 0                                                       ',
        who: 'Module'
        });
      const v81 = stdlib.div(stdlib.UInt_max, v76);
      const v82 = stdlib.le(v75, v81);
      stdlib.assert(v82, {
        at: './util.rsh:28:4:application',
        fs: ['at 32:54:application call to [unknown function] (defined at: ./util.rsh:26:57:function exp)', 'at <top level> call to "chkMulView" (defined at: <top level>)'],
        msg: 'mul overflow                                                    ',
        who: 'Module'
        });
      const v83 = stdlib.mul(v75, v76);
      
      return v83;}),
    doAvgView: ((_v84, _v85, _v86, _v87, _v88, _v89 ) => {
        const v84 = stdlib.protect(ctc0, _v84, null);
        const v85 = stdlib.protect(ctc0, _v85, null);
        const v86 = stdlib.protect(ctc0, _v86, null);
        const v87 = stdlib.protect(ctc0, _v87, null);
        const v88 = stdlib.protect(ctc0, _v88, null);
        const v89 = stdlib.protect(ctc0, _v89, null);
      
      const v91 = stdlib.gt(v85, stdlib.checkedBigNumberify('161:13:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v91, {
        at: '161:5:application',
        fs: ['at <top level> call to "doAvgView" (defined at: <top level>)'],
        msg: 'balA > 0                                                        ',
        who: 'Module'
        });
      const v92 = stdlib.gt(v87, stdlib.checkedBigNumberify('162:13:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v92, {
        at: '162:5:application',
        fs: ['at <top level> call to "doAvgView" (defined at: <top level>)'],
        msg: 'balB > 0                                                        ',
        who: 'Module'
        });
      const v94 = stdlib.muldiv(v84, v88, v85);
      const v96 = stdlib.muldiv(v86, v88, v87);
      const v100 = stdlib.sub(stdlib.UInt_max, v94);
      const v101 = stdlib.ge(v100, v96);
      stdlib.assert(v101, {
        at: './util.rsh:14:4:application',
        fs: ['at ./util.rsh:54:19:application call to [unknown function] (defined at: ./util.rsh:12:57:function exp)', 'at 165:21:application call to "avg" (defined at: ./util.rsh:53:30:function exp)', 'at <top level> call to "doAvgView" (defined at: <top level>)'],
        msg: 'add overflow                                                    ',
        who: 'Module'
        });
      const v102 = stdlib.add(v94, v96);
      const v103 = stdlib.div(v102, stdlib.checkedBigNumberify('./util.rsh:54:28:decimal', stdlib.UInt_max, 2));
      const v104 = stdlib.le(v103, v89);
      stdlib.assert(v104, {
        at: '166:4:application',
        fs: ['at <top level> call to "doAvgView" (defined at: <top level>)'],
        msg: 'result <= poolBalance                                           ',
        who: 'Module'
        });
      
      return v103;}),
    getAmtOutView: ((_v105, _v106, _v107, _v108 ) => {
        const v105 = stdlib.protect(ctc0, _v105, null);
        const v106 = stdlib.protect(ctc0, _v106, null);
        const v107 = stdlib.protect(ctc0, _v107, null);
        const v108 = stdlib.protect(ctc1, _v108, null);
      
      const v116 = v108.fee;
      const v117 = v108.lpFee;
      const v121 = v108.totFee;
      const v122 = stdlib.add(v117, v116);
      const v123 = stdlib.eq(v121, v122);
      const v124 = stdlib.lt(v121, stdlib.checkedBigNumberify('./util.rsh:90:95:decimal', stdlib.UInt_max, 100));
      const v125 = v123 ? v124 : false;
      const v126 = stdlib.gt(v121, stdlib.checkedBigNumberify('./util.rsh:90:111:decimal', stdlib.UInt_max, 0));
      const v127 = v125 ? v126 : false;
      stdlib.assert(v127, {
        at: './util.rsh:94:4:application',
        fs: ['at 100:15:application call to [unknown function] (defined at: ./util.rsh:92:37:function exp)', 'at <top level> call to "getAmtOutView" (defined at: <top level>)'],
        msg: null,
        who: 'Module'
        });
      const v129 = stdlib.sub(stdlib.checkedBigNumberify('102:15:decimal', stdlib.UInt_max, 10000), v121);
      const v131 = stdlib.gt(v129, stdlib.checkedBigNumberify('./util.rsh:27:9:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v131, {
        at: './util.rsh:27:4:application',
        fs: ['at 103:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at <top level> call to "getAmtOutView" (defined at: <top level>)'],
        msg: 'denom > 0                                                       ',
        who: 'Module'
        });
      const v132 = stdlib.div(stdlib.UInt_max, v129);
      const v133 = stdlib.le(v105, v132);
      stdlib.assert(v133, {
        at: './util.rsh:28:4:application',
        fs: ['at 103:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at <top level> call to "getAmtOutView" (defined at: <top level>)'],
        msg: 'mul overflow                                                    ',
        who: 'Module'
        });
      const v134 = stdlib.mul(v105, v129);
      const v136 = stdlib.div(stdlib.UInt_max, stdlib.checkedBigNumberify('104:43:decimal', stdlib.UInt_max, 10000));
      const v137 = stdlib.le(v106, v136);
      stdlib.assert(v137, {
        at: './util.rsh:28:4:application',
        fs: ['at 104:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at <top level> call to "getAmtOutView" (defined at: <top level>)'],
        msg: 'mul overflow                                                    ',
        who: 'Module'
        });
      const v138 = stdlib.mul(v106, stdlib.checkedBigNumberify('104:43:decimal', stdlib.UInt_max, 10000));
      const v140 = stdlib.sub(stdlib.UInt_max, v138);
      const v141 = stdlib.ge(v140, v134);
      stdlib.assert(v141, {
        at: './util.rsh:14:4:application',
        fs: ['at 105:31:application call to "chkA" (defined at: ./util.rsh:12:57:function exp)', 'at <top level> call to "getAmtOutView" (defined at: <top level>)'],
        msg: 'add overflow                                                    ',
        who: 'Module'
        });
      const v142 = stdlib.add(v138, v134);
      const v143 = stdlib.muldiv(v134, v107, v142);
      
      return v143;}),
    getOutAndProtoFeeView: ((_v144, _v145, _v146, _v147 ) => {
        const v144 = stdlib.protect(ctc0, _v144, null);
        const v145 = stdlib.protect(ctc0, _v145, null);
        const v146 = stdlib.protect(ctc0, _v146, null);
        const v147 = stdlib.protect(ctc3, _v147, null);
      
      const v149 = stdlib.gt(stdlib.UInt_max, stdlib.checkedBigNumberify('135:21:decimal', stdlib.UInt_max, 10000));
      stdlib.assert(v149, {
        at: '135:9:application',
        fs: ['at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: null,
        who: 'Module'
        });
      const v154 = v147.fee;
      const v155 = v147.lpFee;
      const v159 = v147.totFee;
      const v160 = stdlib.add(v155, v154);
      const v161 = stdlib.eq(v159, v160);
      const v162 = stdlib.lt(v159, stdlib.checkedBigNumberify('./util.rsh:90:95:decimal', stdlib.UInt_max, 100));
      const v163 = v161 ? v162 : false;
      const v164 = stdlib.gt(v159, stdlib.checkedBigNumberify('./util.rsh:90:111:decimal', stdlib.UInt_max, 0));
      const v165 = v163 ? v164 : false;
      stdlib.assert(v165, {
        at: './util.rsh:94:4:application',
        fs: ['at 136:20:application call to [unknown function] (defined at: ./util.rsh:92:37:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: null,
        who: 'Module'
        });
      const v178 = stdlib.mul(v154, stdlib.checkedBigNumberify('./util.rsh:117:38:decimal', stdlib.UInt_max, 100));
      const v179 = stdlib.div(v178, v159);
      const v181 = stdlib.gt(v146, stdlib.checkedBigNumberify('./util.rsh:120:19:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v181, {
        at: './util.rsh:120:5:application',
        fs: ['at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: null,
        who: 'Module'
        });
      const v203 = stdlib.sub(stdlib.checkedBigNumberify('./util.rsh:102:15:decimal', stdlib.UInt_max, 10000), v159);
      const v205 = stdlib.gt(v203, stdlib.checkedBigNumberify('./util.rsh:27:9:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v205, {
        at: './util.rsh:27:4:application',
        fs: ['at ./util.rsh:103:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at ./util.rsh:121:36:application call to [unknown function] (defined at: ./util.rsh:97:68:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'denom > 0                                                       ',
        who: 'Module'
        });
      const v206 = stdlib.div(stdlib.UInt_max, v203);
      const v207 = stdlib.le(v144, v206);
      stdlib.assert(v207, {
        at: './util.rsh:28:4:application',
        fs: ['at ./util.rsh:103:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at ./util.rsh:121:36:application call to [unknown function] (defined at: ./util.rsh:97:68:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'mul overflow                                                    ',
        who: 'Module'
        });
      const v208 = stdlib.mul(v144, v203);
      const v210 = stdlib.div(stdlib.UInt_max, stdlib.checkedBigNumberify('./util.rsh:104:43:decimal', stdlib.UInt_max, 10000));
      const v211 = stdlib.le(v145, v210);
      stdlib.assert(v211, {
        at: './util.rsh:28:4:application',
        fs: ['at ./util.rsh:104:31:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at ./util.rsh:121:36:application call to [unknown function] (defined at: ./util.rsh:97:68:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'mul overflow                                                    ',
        who: 'Module'
        });
      const v212 = stdlib.mul(v145, stdlib.checkedBigNumberify('./util.rsh:104:43:decimal', stdlib.UInt_max, 10000));
      const v214 = stdlib.sub(stdlib.UInt_max, v212);
      const v215 = stdlib.ge(v214, v208);
      stdlib.assert(v215, {
        at: './util.rsh:14:4:application',
        fs: ['at ./util.rsh:105:31:application call to "chkA" (defined at: ./util.rsh:12:57:function exp)', 'at ./util.rsh:121:36:application call to [unknown function] (defined at: ./util.rsh:97:68:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'add overflow                                                    ',
        who: 'Module'
        });
      const v216 = stdlib.add(v212, v208);
      const v217 = stdlib.muldiv(v208, v146, v216);
      const v218 = stdlib.gt(v217, stdlib.checkedBigNumberify('./util.rsh:122:17:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v218, {
        at: './util.rsh:122:4:application',
        fs: ['at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'amtOut > 0',
        who: 'Module'
        });
      const v223 = stdlib.sub(stdlib.UInt_max, v145);
      const v224 = stdlib.ge(v223, v144);
      stdlib.assert(v224, {
        at: './util.rsh:14:4:application',
        fs: ['at ./util.rsh:64:19:application call to "chkA" (defined at: ./util.rsh:12:57:function exp)', 'at ./util.rsh:123:48:application call to [unknown function] (defined at: ./util.rsh:62:75:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'add overflow                                                    ',
        who: 'Module'
        });
      const v225 = stdlib.add(v145, v144);
      const v226 = stdlib.gt(v225, stdlib.checkedBigNumberify('./util.rsh:65:11:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v226, {
        at: './util.rsh:65:4:application',
        fs: ['at ./util.rsh:123:48:application call to [unknown function] (defined at: ./util.rsh:62:75:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: null,
        who: 'Module'
        });
      const v227 = stdlib.muldiv(v144, v146, v225);
      const v229 = stdlib.ge(v227, v217);
      stdlib.assert(v229, {
        at: './util.rsh:40:4:application',
        fs: ['at ./util.rsh:124:23:application call to "chkS" (defined at: ./util.rsh:39:57:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'a >= b                                                          ',
        who: 'Module'
        });
      const v230 = stdlib.sub(v227, v217);
      const v231 = stdlib.muldiv(v144, v154, stdlib.checkedBigNumberify('./util.rsh:126:38:decimal', stdlib.UInt_max, 10000));
      const v233 = stdlib.gt(v179, stdlib.checkedBigNumberify('./util.rsh:27:9:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v233, {
        at: './util.rsh:27:4:application',
        fs: ['at ./util.rsh:127:23:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'denom > 0                                                       ',
        who: 'Module'
        });
      const v234 = stdlib.div(stdlib.UInt_max, v179);
      const v235 = stdlib.le(v230, v234);
      stdlib.assert(v235, {
        at: './util.rsh:28:4:application',
        fs: ['at ./util.rsh:127:23:application call to "chkM" (defined at: ./util.rsh:26:57:function exp)', 'at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'outFee',
        who: 'Module'
        });
      const v236 = stdlib.mul(v230, v179);
      const v237 = stdlib.div(v236, stdlib.checkedBigNumberify('./util.rsh:127:52:decimal', stdlib.UInt_max, 100));
      const v238 = stdlib.le(v237, v230);
      stdlib.assert(v238, {
        at: './util.rsh:128:4:application',
        fs: ['at 138:36:application call to [unknown function] (defined at: ./util.rsh:110:82:function exp)', 'at <top level> call to "getOutAndProtoFeeView" (defined at: <top level>)'],
        msg: 'pFeeOut <= outFee',
        who: 'Module'
        });
      const v240 = stdlib.muldiv(v237, v145, v146);
      const v241 = stdlib.ge(v240, v231);
      const v242 = [v217, stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, 0), v237];
      const v243 = [v217, v231, stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, 0)];
      const v244 = v241 ? v242 : v243;
      
      return v244;}),
    initialFees: (() => {
      
      const v245 = {
        fee: stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, 5),
        lpFee: stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, 25),
        totFee: stdlib.checkedBigNumberify('<builtin>', stdlib.UInt_max, 30)
        };
      
      return v245;})(),
    mintView: ((_v246, _v247, _v248 ) => {
        const v246 = stdlib.protect(ctc0, _v246, null);
        const v247 = stdlib.protect(ctc0, _v247, null);
        const v248 = stdlib.protect(ctc0, _v248, null);
      
      const v250 = stdlib.muldiv(v246, v248, v247);
      
      return v250;}),
    verifySqrtView: ((_v251, _v252, _v253, _v254 ) => {
        const v251 = stdlib.protect(ctc0, _v251, null);
        const v252 = stdlib.protect(ctc0, _v252, null);
        const v253 = stdlib.protect(ctc0, _v253, null);
        const v254 = stdlib.protect(ctc0, _v254, null);
      
      const v256 = stdlib.gt(v251, stdlib.checkedBigNumberify('183:15:decimal', stdlib.UInt_max, 0));
      stdlib.assert(v256, {
        at: '183:5:application',
        fs: ['at <top level> call to "verifySqrtView" (defined at: <top level>)'],
        msg: 'minted > 0                                                      ',
        who: 'Module'
        });
      const v257 = stdlib.muldiv(v252, v253, v251);
      const v258 = stdlib.ge(v257, v251);
      stdlib.assert(v258, {
        at: '185:4:application',
        fs: ['at <top level> call to "verifySqrtView" (defined at: <top level>)'],
        msg: 'muldiv(amtA, amtB, minted) >= minted                            ',
        who: 'Module'
        });
      const v259 = stdlib.le(v251, v254);
      stdlib.assert(v259, {
        at: '186:4:application',
        fs: ['at <top level> call to "verifySqrtView" (defined at: <top level>)'],
        msg: 'minted <= poolBalance                                           ',
        who: 'Module'
        });
      
      return v251;})
    };
  };
export function _getEvents(s) {
  const stdlib = s.reachStdlib;
  return {
    };
  };
export function _getViews(s, viewlib) {
  const stdlib = s.reachStdlib;
  
  return {
    infos: {
      },
    views: {
      }
    };
  
  };
export function _getMaps(s) {
  const stdlib = s.reachStdlib;
  const ctc0 = stdlib.T_Tuple([]);
  return {
    mapDataTy: ctc0
    };
  };
const _ALGO = {
  ABI: {
    sigs: []
    },
  appApproval: `BSACAAEmAQAiNQAxGEEAWChkSSJbNQGBCFs1AjYaABdJQQAJIjUDIzUFQgA5NhoBFzYaAhc1AzYaAzUEQgAnKDQBFjQCFlBnNAVBAAqABBUffHU0BlCwNABJIwgyBBJEMRYSRCNDIkMxGSISRCI1ASI1AkL/yQ==`,
  appClear: `BQ==`,
  extraPages: 0,
  mapDataKeys: 0,
  mapDataSize: 0,
  stateKeys: 0,
  stateSize: 0,
  unsupported: [],
  version: 9,
  warnings: []
  };
const _ETH = {
  ABI: `[
  {
    "stateMutability": "payable",
    "type": "fallback"
  },
  {
    "inputs": [],
    "name": "_reachCreationTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_reachCurrentState",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      },
      {
        "internalType": "bytes",
        "name": "",
        "type": "bytes"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "inputs": [],
    "name": "_reachCurrentTime",
    "outputs": [
      {
        "internalType": "uint256",
        "name": "",
        "type": "uint256"
      }
    ],
    "stateMutability": "view",
    "type": "function"
  },
  {
    "stateMutability": "payable",
    "type": "receive"
  }
]`,
  Bytecode: `0x608060405234801561001057600080fd5b50610205806100206000396000f3fe6080604052600436106100355760003560e01c80631e93b0f11461003e5780638323075714610062578063ab53f2c61461007757005b3661003c57005b005b34801561004a57600080fd5b506003545b6040519081526020015b60405180910390f35b34801561006e57600080fd5b5060015461004f565b34801561008357600080fd5b5061008c61009a565b604051610059929190610137565b6000606060005460028080546100af90610194565b80601f01602080910402602001604051908101604052809291908181526020018280546100db90610194565b80156101285780601f106100fd57610100808354040283529160200191610128565b820191906000526020600020905b81548152906001019060200180831161010b57829003601f168201915b50505050509050915091509091565b82815260006020604081840152835180604085015260005b8181101561016b5785810183015185820160600152820161014f565b8181111561017d576000606083870101525b50601f01601f191692909201606001949350505050565b600181811c908216806101a857607f821691505b602082108114156101c957634e487b7160e01b600052602260045260246000fd5b5091905056fea2646970667358221220c0b33c9d9c5fa41b53a07c7c21886bdf0ec7c14bf0efa827e75f2634fdaa1b0f64736f6c63430008090033`,
  BytecodeLen: 549,
  Which: `oD`,
  version: 6,
  views: {
    }
  };
export const _Connectors = {
  ALGO: _ALGO,
  ETH: _ETH
  };
export const _Participants = {
  };
export const _APIs = {
  };
