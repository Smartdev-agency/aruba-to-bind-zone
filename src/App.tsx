import React, { useState } from 'react';
import zonefile from 'dns-zonefile';
import { MantineProvider } from '@mantine/core'
import {
  Title,
  Text,
  Container,
  Group,
  Button,
  createStyles,
  Paper,
  TextInput,
  PasswordInput,
  Checkbox
} from '@mantine/core';
import { Dropzone, MIME_TYPES } from '@mantine/dropzone';
import { IconCloudUpload, IconX, IconDownload } from '@tabler/icons';
import axios from './api'
import { useForm } from "@mantine/form"
import { NotificationsProvider, showNotification } from "@mantine/notifications"

const useStyles = createStyles((theme) => ({
  wrapper: {
    position: 'relative',
    marginBottom: 16,
  },

  dropzone: {
    borderWidth: 1,
  },

  icon: {
    color: theme.colorScheme === 'dark' ? theme.colors.dark[3] : theme.colors.gray[4],
  },

  control: {
    position: 'absolute',
    width: 250,
    left: 'calc(50% - 125px)',
    bottom: -20,
  },
}));

function App() {

  const { classes, theme } = useStyles();
  const FileSaver = require('file-saver');

  const [isLoading, setIsLoading] = useState(false);
  const [isSendable, setIsSendable] = useState(false)
  const [fileName, setFileName] = useState<string>('')

  const form = useForm({
    initialValues: {
      fileUpload: {},
      domainName: '',
      serverMail: true
    }
  });

  const handleUploadFile = (file: any) => {
    form.setFieldValue('fileUpload', file);
    setFileName(file[0].name);
    setIsSendable(true);
  }

  const onSubmit = async (values: any) => {

    setIsLoading(true);

    values.fileUpload = values.fileUpload[0];

    try {
      const { data } = await axios.post('/export.php', values);
      const output = zonefile.generate(data);

      const blob = new Blob([output]);
      FileSaver.saveAs(blob, `${values.domainName.split('.').join("")}-bindzone.txt`);

    } catch(err) {
      console.log(err);
    }

    form.reset();
    setIsSendable(false)
    setFileName('')
    setIsLoading(false)

  }

  return (
    <MantineProvider
      theme={{
        colorScheme: 'dark',
        primaryColor: 'violet'
      }}
      withGlobalStyles
      withNormalizeCSS
    >
      <NotificationsProvider autoClose={5000}>
        <Container size={420} my={100}>
          <Title
            order={1}
            align="center"
          >
            Aruba to BIND Zone
          </Title>
          <Text color="dimmed" size="sm" align="center" mt={5} mb={40}>
            Esporta da Aruba la configurazione DNS in formato csv e convertila in un BIND Zone File per Cloudflare.
          </Text>

          <Paper withBorder shadow="md" p={30} mt={30} radius="md">
            <form onSubmit={form.onSubmit((values) => onSubmit(values))}>

              <div className={classes.wrapper}>
                <Dropzone
                  onDrop={(file) => handleUploadFile(file)}
                  onReject={() => console.log('Formato file non accettato')}
                  className={classes.dropzone}
                  radius="md"
                  accept={['text/csv']}
                  multiple={false}
                >
                  <div style={{ pointerEvents: 'none' }}>
                    <Group position="center">
                      <Dropzone.Idle>
                        <IconCloudUpload
                          size={50}
                          color={theme.colors.dark[0]}
                          stroke={1.5}
                        />
                      </Dropzone.Idle>
                    </Group>

                    <Text align="center" weight={700} size="lg" mt="xl">
                      {fileName ? fileName : 'Trascina file qui'}
                    </Text>
                    <Text align="center" size="sm" mt="xs" color="dimmed">
                      Trascina il file esportato da Aruba qui. Solo il formato <i>.csv</i> è consentito.
                    </Text>
                  </div>
                </Dropzone>

              </div>

              <TextInput
                label="Nome dominio"
                placeholder="nomedominio.com"
                mb={16}
                required
                {...form.getInputProps('domainName')}
              />

              <Checkbox
                label="Includi server di posta"
                {...form.getInputProps('serverMail', { type: 'checkbox' })}
              />

              <Button type="submit" disabled={!isSendable} loading={isLoading} fullWidth mt="xl">Invia</Button>
            </form>
          </Paper>

        </Container>
      </NotificationsProvider>
    </MantineProvider>
  );
}

export default App;
