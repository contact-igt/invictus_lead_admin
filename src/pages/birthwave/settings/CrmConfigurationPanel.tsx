import { useState } from 'react';
import { Box, Tab, Tabs } from '@mui/material';
import StandardFieldsPanel from './StandardFieldsPanel';
import CustomFieldsManager from './CustomFieldsManager';
import FieldMappingPanel from './FieldMappingPanel';

interface CrmConfigurationPanelProps {
  clientKey: string | undefined;
}

const CrmConfigurationPanel = ({ clientKey }: CrmConfigurationPanelProps) => {
  const [tab, setTab] = useState(0);

  return (
    <Box>
      <Tabs
        value={tab}
        onChange={(_, value) => setTab(value)}
        variant="scrollable"
        scrollButtons="auto"
        sx={{ mb: 2.5, minHeight: 36, '& .MuiTab-root': { textTransform: 'none', minHeight: 36, fontSize: '0.82rem', fontWeight: 600 } }}
      >
        <Tab label="Standard Fields" />
        <Tab label="Custom Fields" />
        <Tab label="Field Mapping" />
      </Tabs>

      {tab === 0 && <StandardFieldsPanel />}
      {tab === 1 && <CustomFieldsManager clientKey={clientKey} />}
      {tab === 2 && <FieldMappingPanel clientKey={clientKey} />}
    </Box>
  );
};

export default CrmConfigurationPanel;
