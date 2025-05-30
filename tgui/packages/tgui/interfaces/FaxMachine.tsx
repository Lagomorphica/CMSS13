import type { BooleanLike } from 'common/react';
import { useBackend } from 'tgui/backend';
import {
  Box,
  Button,
  Flex,
  Icon,
  NoticeBox,
  Section,
  Stack,
} from 'tgui/components';
import { Window } from 'tgui/layouts';

type Data = {
  department: string;
  network: string;
  machine_id_tag: string;
  idcard: string | null;
  paper: string | null;
  paper_name?: string;
  authenticated: BooleanLike;
  target_department: string;
  target_machine: string;
  sending_to_specific: BooleanLike;
  highcom_dept: BooleanLike;
  awake_responder: BooleanLike;
  worldtime: number;
  nextfaxtime: number;
  faxcooldown: number;
  can_send_priority: BooleanLike;
  is_priority_fax: BooleanLike;
  is_single_sending: BooleanLike;
};

export const FaxMachine = () => {
  const { act, data } = useBackend<Data>();
  const { idcard } = data;
  const body = idcard ? <FaxMain /> : <FaxEmpty />;
  const windowWidth = idcard ? 800 : 400;
  const windowHeight = idcard ? 440 : 215;

  return (
    <Window width={windowWidth} height={windowHeight} theme="weyland">
      <Window.Content>{body}</Window.Content>
    </Window>
  );
};

const FaxMain = (props) => {
  const { data } = useBackend<Data>();
  const { machine_id_tag, awake_responder, highcom_dept } = data;
  return (
    <>
      <FaxId />
      <FaxSelect />
      <ConfirmSend />
      <NoticeBox color="grey" textAlign="center">
        The machine identification is {machine_id_tag}.
      </NoticeBox>
      {!!highcom_dept && (
        <NoticeBox
          color={awake_responder ? 'orange' : 'grey'}
          textAlign="center"
        >
          A designated communications operator is
          {awake_responder ? ' currently' : ' not currently'} awake.
          <br />
          Message responses
          {awake_responder ? ' are likely to be swift.' : ' may be delayed.'}
        </NoticeBox>
      )}
    </>
  );
};

const FaxId = (props) => {
  const { act, data } = useBackend<Data>();
  const { department, network, idcard, authenticated } = data;
  return (
    <Section title="Authentication">
      <NoticeBox color="grey" textAlign="center">
        This machine is currently operating on the {network}
        <br />
        and is sending from the {department} department.
      </NoticeBox>
      <Stack>
        <Stack.Item>
          <Button icon="eject" mb="0" onClick={() => act('ejectid')}>
            {idcard}
          </Button>
        </Stack.Item>
        <Stack.Item grow>
          <Button
            icon="sign-in-alt"
            fluid
            selected={authenticated}
            onClick={() => act(authenticated ? 'logout' : 'auth')}
          >
            {authenticated ? 'Log Out' : 'Log In'}
          </Button>
        </Stack.Item>
      </Stack>
    </Section>
  );
};

const FaxSelect = (props) => {
  const { act, data } = useBackend<Data>();
  const {
    paper,
    authenticated,
    target_department,
    can_send_priority,
    is_priority_fax,
    is_single_sending,
    target_machine,
    highcom_dept,
    sending_to_specific,
  } = data;

  return (
    <Section title="Department selection">
      <Stack>
        <Stack.Item>
          <Button
            icon="list"
            disabled={!authenticated}
            onClick={() => act('select_dept')}
            width="220px"
          >
            Select department to send to
          </Button>
        </Stack.Item>
        <Stack.Item grow>
          <Button icon="building" fluid disabled={!authenticated}>
            {'Currently sending to : ' + target_department + '.'}
          </Button>
        </Stack.Item>
        <Stack.Item>
          <Button
            icon={is_single_sending ? 'user' : 'users'}
            fluid
            onClick={() => act('toggle_single_send')}
            color={is_single_sending ? 'purple' : 'blue'}
            disabled={
              !paper ||
              !!highcom_dept ||
              !authenticated ||
              !!sending_to_specific
            }
            tooltip="Toggle sending to a specific machine in the department."
          />
        </Stack.Item>
      </Stack>
      <Box width="600px" height="5px" />
      <Stack>
        <Stack.Item>
          <Button
            icon="list"
            disabled={
              !authenticated || !is_single_sending || !!sending_to_specific
            }
            onClick={() => act('select_machine')}
            width="220px"
          >
            Select machine to send to
          </Button>
        </Stack.Item>
        <Stack.Item grow>
          <Button
            icon="fax"
            fluid
            disabled={
              !authenticated || !is_single_sending || !!sending_to_specific
            }
          >
            {'Currently sending to : ' + target_machine + '.'}
          </Button>
        </Stack.Item>
      </Stack>
    </Section>
  );
};

const ConfirmSend = (props) => {
  const { act, data } = useBackend<Data>();
  const {
    paper,
    paper_name,
    authenticated,
    worldtime,
    nextfaxtime,
    can_send_priority,
    is_priority_fax,
  } = data;

  const timeLeft = nextfaxtime - worldtime;

  return (
    <Section title="Send Confirmation">
      <Box width="600px" height="5px" />
      <Stack>
        <Stack.Item>
          <Button
            icon="eject"
            fluid
            onClick={() => act(paper ? 'ejectpaper' : 'insertpaper')}
            color={paper ? 'default' : 'grey'}
          >
            {paper ? 'Currently sending : ' + paper_name : 'No paper loaded!'}
          </Button>
        </Stack.Item>
        <Stack.Item grow>
          {(timeLeft < 0 && (
            <Button
              icon="paper-plane"
              fluid
              onClick={() => act('send')}
              disabled={timeLeft > 0 || !paper || !authenticated}
            >
              {paper ? 'Send' : 'No paper loaded!'}
            </Button>
          )) || (
            <Button icon="window-close" fluid disabled={1}>
              {'Transmitters realigning, ' + timeLeft / 10 + ' seconds left.'}
            </Button>
          )}
        </Stack.Item>
        {!!can_send_priority && (
          <Stack.Item>
            <Button
              icon={is_priority_fax ? 'bell' : 'bell-slash'}
              fluid
              onClick={() => act('toggle_priority')}
              color={is_priority_fax ? 'green' : 'red'}
              disabled={!paper || !can_send_priority || !authenticated}
              tooltip="Toggle priority alert."
            />
          </Stack.Item>
        )}
      </Stack>
    </Section>
  );
};

const FaxEmpty = (props) => {
  const { act, data } = useBackend<Data>();
  const { paper, paper_name } = data;
  return (
    <Section textAlign="center" fill>
      <Flex height="100%">
        <Flex.Item grow="1" align="center" color="red">
          <Icon name="times-circle" mb="0.5rem" size={5} color="red" />
          <br />
          No ID card detected.
          <br />
          {paper && (
            <Button
              icon="eject"
              onClick={() => act('ejectpaper')}
              disabled={!paper}
            >
              {'Eject ' + paper_name + '.'}
            </Button>
          )}
        </Flex.Item>
      </Flex>
    </Section>
  );
};
