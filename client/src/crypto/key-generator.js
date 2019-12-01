import { createDiffieHellman } from 'diffie-hellman';

/**
 * @example
 * const alice = new KeyGenerator();
 * const bob = new KeyGenerator(...alice.getGeneratorParams())
 * alice.generateSecret(bob.getPublic());
 * bob.generateSecret(alice.getPublic());
 */
class KeyGenerator {
  constructor(prime = 2028, generator = undefined) {
    this.client = createDiffieHellman(prime, generator);
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