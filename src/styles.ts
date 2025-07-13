import { css } from 'lit';

/**
 * Styles for the Waterflow Card
 * Includes responsive design and theme integration
 */
export const cardStyle = css`
  ha-card {
    padding: 16px;
    color: var(--primary-text-color, #212121);
    background: var(--card-background-color, #fff);
  }

  h2 {
    margin: 0 0 16px 0;
    font-size: 1.2em;
    color: var(--primary-text-color, #212121);
    font-weight: 500;
  }

  #chart {
    height: 300px;
    width: 100%;
    margin-bottom: 8px;
  }

  .warning {
    padding: 16px;
    color: var(--warning-color, #ffa726);
    display: flex;
    justify-content: center;
    align-items: center;
    min-height: 100px;
  }

  .error {
    padding: 16px;
    color: var(--error-color, #db4437);
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: center;
    min-height: 100px;
  }

  .error mwc-button {
    margin-top: 16px;
  }

  /* Responsive design */
  @media (max-width: 600px) {
    #chart {
      height: 250px;
    }
    
    h2 {
      font-size: 1.1em;
    }
  }

  @media (max-width: 400px) {
    #chart {
      height: 200px;
    }
    
    ha-card {
      padding: 12px;
    }
  }
`;
