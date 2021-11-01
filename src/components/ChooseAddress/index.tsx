import Row from 'antd/lib/row';
import Col from 'antd/lib/col';
import Select from 'antd/lib/select';
import Input from 'antd/lib/input';
import Tooltip from 'antd/lib/tooltip';
import Title from 'antd/lib/typography/Title';
import Space from 'antd/lib/space';
import Button from 'antd/lib/button';
import { useEffect } from 'react';
import { useWeb3React } from '@web3-react/core';
import {
  formatAddress,
  getChainData,
  getChainList,
  requestChangeNetwork,
} from 'src/helpers/wallet';
import ArrowRightOutlined from '@ant-design/icons/ArrowRightOutlined';
import { bridgeAddressState } from 'src/state/bridge';
import { useRecoilState } from 'recoil';
import { InjectedConnector } from '@web3-react/injected-connector';

import ChooseAddressStyle from './style';

const { Option } = Select;

type ChooseAccountPropType = {
  active: boolean;
  next: () => void;
};

export const injected = new InjectedConnector({
  supportedChainIds: [1, 3, 4, 5, 42, 56, 97],
});

const ChooseAccount: React.FC<ChooseAccountPropType> = ({ active, next }) => {
  const CHAIN_LIST = getChainList();
  const [bridgeAddress, setBridgeAddress] = useRecoilState(bridgeAddressState);
  const { account, activate, deactivate, chainId } = useWeb3React();

  const connect = async () => {
    try {
      await activate(injected);
    } catch (ex) {
      console.log(ex);
    }
  };

  const disconnect = async () => {
    try {
      deactivate();
    } catch (ex) {
      console.log(ex);
    }
  };

  const validate = (): boolean => {
    return true;
  };

  const validateAndNext = () => {
    if (validate()) {
      next();
    }
  };

  useEffect(() => {
    if (bridgeAddress.sourceChain) {
      requestChangeNetwork(bridgeAddress.sourceChain);
    }
  }, [chainId, bridgeAddress.sourceChain]);

  useEffect(() => {
    setBridgeAddress({
      ...bridgeAddress,
      sourceAddress: account || '',
    });
  }, [account, chainId]);

  return (
    <ChooseAddressStyle>
      <div className='box'>
        {active ? (
          <>
            <Row gutter={48}>
              <Col span={11}>
                <Space direction='vertical'>
                  <Title level={5}>From</Title>
                  <Select
                    placeholder='Select source chain'
                    value={bridgeAddress.sourceChain}
                    onChange={(value) =>
                      setBridgeAddress({
                        ...bridgeAddress,
                        sourceChain: value,
                      })
                    }
                  >
                    {CHAIN_LIST.map((chainItem) => (
                      <Option value={chainItem.value} key={chainItem.id}>
                        <img src={`/${chainItem.value}.svg`} /> {chainItem.name}
                      </Option>
                    ))}
                  </Select>
                  <div />
                  <Title level={5}>Source Address</Title>
                  <Button
                    type='primary'
                    className='blue'
                    block
                    shape='round'
                    onClick={account ? disconnect : connect}
                  >
                    {account
                      ? `disconnect ${formatAddress(account, 5)}`
                      : 'Connect Wallet'}
                  </Button>
                </Space>
              </Col>
              <Col span={2} className='arrow-container'>
                <ArrowRightOutlined />
              </Col>
              <Col span={11}>
                <Space direction='vertical'>
                  <Title level={5}>To</Title>
                  <Select
                    placeholder='Select target chain'
                    value={bridgeAddress.targetChain}
                    onChange={(value) =>
                      setBridgeAddress({
                        ...bridgeAddress,
                        targetChain: value,
                      })
                    }
                  >
                    {CHAIN_LIST.map((chainItem) => (
                      <Option value={chainItem.value} key={chainItem.id}>
                        <img src={`/${chainItem.value}.svg`} /> {chainItem.name}
                      </Option>
                    ))}
                  </Select>
                  <div />
                  <Title level={5}>Target Address</Title>
                  <Tooltip
                    placement='bottomLeft'
                    trigger={['hover']}
                    title={bridgeAddress.targetAddress}
                    overlayInnerStyle={{
                      width: 370,
                      borderRadius: 8,
                    }}
                  >
                    <Input
                      placeholder='Fill recipient address'
                      value={bridgeAddress.targetAddress}
                      onChange={(e) =>
                        setBridgeAddress({
                          ...bridgeAddress,
                          targetAddress: e.target.value,
                        })
                      }
                    />
                  </Tooltip>
                </Space>
              </Col>
            </Row>
            <div className='next-container'>
              <Button type='primary' shape='round' onClick={validateAndNext}>
                Next
              </Button>
            </div>
          </>
        ) : (
          <div>
            <p className='address-detail'>
              From:{' '}
              <span className='address'>{bridgeAddress.sourceAddress}</span> (
              {getChainData(bridgeAddress.sourceChain!)?.name})
            </p>
            <p className='address-detail'>
              To: <span className='address'>{bridgeAddress.targetAddress}</span>{' '}
              ({getChainData(bridgeAddress.targetChain!)?.name})
            </p>
          </div>
        )}
      </div>
    </ChooseAddressStyle>
  );
};

export default ChooseAccount;
