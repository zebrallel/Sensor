import './index.css'
import { useMappedState, useDispatch } from 'redux-react-hook'
import { useCallback, useEffect, useState } from 'react'
import { IRootState, IDispatch } from '@src/store'
import Login from './Login'
import { Picker, Flex } from 'antd-mobile'
import IconSvg from '@src/components/IconSvg'
import { IContract } from '@src/models/market'
import { IContractBody } from '@src/types/contract'
import get from 'lodash/get'
import find from 'lodash/find'
import { format } from '@src/utils'
import { directions, offsets, orderTypes } from './config'

type TContractBodyMap = { [key: string]: IContractBody }
interface IMappedState {
    hasLogin: boolean
    contracts: IContract[]
    contractBodyMap: TContractBodyMap
}
function Trade() {
    const mapState = useCallback(
        (state: IRootState) => ({
            hasLogin: state.trade.hasLogin,
            contracts: state.market.contracts,
            contractBodyMap: state.market.contractBodyMap,
        }),
        []
    )
    const { hasLogin, contracts, contractBodyMap } = useMappedState<IMappedState>(mapState)
    const dispatch = useDispatch<IDispatch>()
    const contractPickerData = createContractPickerData(contracts)
    const [pickedIds, setPickedIds] = useState<any>([])
    const [directionValue, setDirectionValue] = useState<number>(0)
    const [offsetValue, setOffsetValue] = useState<number>(0)
    const [amountValue, setAmountValue] = useState<string>('0')
    const [orderTypeValue, setOrderTypeValue] = useState<any>(0)
    const body = getContractBody(pickedIds, contracts, contractBodyMap)

    useEffect(() => {
        dispatch.market.fetchContracts()
    }, [])

    if (!hasLogin) {
        return <Login />
    }

    return (
        <div styleName="trade">
            <div styleName="item">
                <div styleName="label">合约:</div>
                <div styleName="content">
                    <Picker
                        value={pickedIds}
                        data={contractPickerData}
                        cols={1}
                        onChange={value => {
                            setPickedIds(value)
                        }}
                    >
                        <CustomChildren>
                            <IconSvg name="back" styleName="icon-expand" />
                        </CustomChildren>
                    </Picker>
                </div>
            </div>
            <div styleName="item">
                <div styleName="label">最新价:</div>
                <div styleName="content">{format(get(body, 'QLastPrice', '--'))}</div>
            </div>
            <div styleName="item">
                <div styleName="label">买价:</div>
                <div styleName="content">{format(get(body, 'QBidPrice[0]', '--'))}</div>
            </div>
            <div styleName="item">
                <div styleName="label">卖价:</div>
                <div styleName="content">{format(get(body, 'QAskPrice[0]', '--'))}</div>
            </div>
            <div styleName="item">
                <div styleName="label">方向:</div>
                <div styleName="content">
                    <Flex>
                        {directions.map(direction => {
                            return (
                                <Flex.Item key={direction.label}>
                                    <label htmlFor={direction.label}>{direction.label}</label>
                                    <input
                                        id={direction.label}
                                        name="direction"
                                        type="radio"
                                        checked={directionValue === direction.value}
                                        value={direction.value}
                                        onChange={(eve: React.SyntheticEvent<HTMLInputElement>) => {
                                            setDirectionValue(Number(eve.currentTarget.value))
                                        }}
                                    />
                                </Flex.Item>
                            )
                        })}
                    </Flex>
                </div>
            </div>
            <div styleName="item">
                <div styleName="label">开平:</div>
                <div styleName="content">
                    <Flex>
                        {offsets.map(offset => {
                            return (
                                <Flex.Item key={offset.label}>
                                    <label htmlFor={offset.label}>{offset.label}</label>
                                    <input
                                        id={offset.label}
                                        name="offset"
                                        type="radio"
                                        checked={offsetValue === offset.value}
                                        value={offset.value}
                                        onChange={(eve: React.SyntheticEvent<HTMLInputElement>) => {
                                            setOffsetValue(Number(eve.currentTarget.value))
                                        }}
                                    />
                                </Flex.Item>
                            )
                        })}
                    </Flex>
                </div>
            </div>
            <div styleName="item">
                <div styleName="label">数量:</div>
                <div styleName="content">
                    <input
                        type="number"
                        value={amountValue}
                        onChange={(eve: React.SyntheticEvent<HTMLInputElement>) => {
                            setAmountValue(eve.currentTarget.value)
                        }}
                    />
                </div>
            </div>
        </div>
    )
}

function createContractPickerData(contracts: IContract[]) {
    return contracts.map(contract => ({ label: contract.contractName, value: contract.id }))
}

function CustomChildren(props: any) {
    return (
        <div onClick={props.onClick}>
            <div style={{ display: 'flex', height: '100%', alignItems: 'center' }}>
                <div style={{ fontSize: 13, color: '#ccc', flex: 1 }}>{props.extra}</div>
                <div style={{ width: 30 }}>{props.children}</div>
            </div>
        </div>
    )
}

function getContractBody(pickedIds: any[], contracts: IContract[], contractBodyMap: TContractBodyMap) {
    if (!pickedIds.length) {
        return null
    }

    const contractId = pickedIds[0]
    const contract = find(contracts, ['id', contractId])
    const { commodityNo, contractNo } = contract as IContract
    const itemKey = commodityNo + contractNo
    const body: IContractBody = contractBodyMap[itemKey]

    return body
}

export default Trade
