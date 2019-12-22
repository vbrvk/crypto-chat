import { createDiffieHellman } from 'diffie-hellman';

/**
 * @example
 * const alice = new KeyGenerator();
 * const bob = new KeyGenerator(...alice.getGeneratorParams())
 * bob.generateSecret(alice.getPublic());
 * alice.generateSecret(bob.getPublic());
 */
class KeyGenerator {
  constructor(prime = 128, generator = undefined) {
    console.log('Started key generation');
    this.client = createDiffieHellman(prime, generator);
    console.log('Ended key generation');
    this.pubKey = this.client.generateKeys()
  }

  generateSecret(otherPubKey) {
    this.secret = this.client.computeSecret(otherPubKey);
  }

  getGeneratorParams(){
    return [this.client.getPrime(), this.client.getGenerator()];
  }

  getSecret() {
    return this.secret || null;
  }

  getPublic() {
    return this.pubKey;
  }
}

export default KeyGenerator;