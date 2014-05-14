<?php
/**  
 * This program is free software; you can redistribute it and/or
 * modify it under the terms of the GNU General Public License
 * as published by the Free Software Foundation; under version 2
 * of the License (non-upgradable).
 * 
 * This program is distributed in the hope that it will be useful,
 * but WITHOUT ANY WARRANTY; without even the implied warranty of
 * MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 * GNU General Public License for more details.
 * 
 * You should have received a copy of the GNU General Public License
 * along with this program; if not, write to the Free Software
 * Foundation, Inc., 51 Franklin Street, Fifth Floor, Boston, MA  02110-1301, USA.
 * 
 * Copyright (c) 2008-2010 (original work) Deutsche Institut für Internationale Pädagogische Forschung (under the project TAO-TRANSFER);
 *               2009-2012 (update and modification) Public Research Centre Henri Tudor (under the project TAO-SUSTAIN & TAO-DEV);
 * 
 */

/**
 * Short description of class tao_helpers_form_validators_DateTime
 *
 * @access public
 * @author Joel Bout, <joel.bout@tudor.lu>
 * @package tao
 
 */
class tao_helpers_form_validators_DateTime
    extends tao_helpers_form_Validator
{
    // --- ASSOCIATIONS ---


    // --- ATTRIBUTES ---

    // --- OPERATIONS ---

    /**
     * Short description of method __construct
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  array options
     * @return mixed
     */
    public function __construct($options = array())
    {
        
		 
		parent::__construct($options);
		
        
    }

    /**
     * Short description of method evaluate
     *
     * @access public
     * @author Joel Bout, <joel.bout@tudor.lu>
     * @param  values
     * @return boolean
     */
    public function evaluate($values)
    {
        $returnValue = (bool) false;

        
		$value = trim($values);
		/*
		if(empty($value)){
			$returnValue = true;//no need to go further. To check if not empty, use the NotEmpty validator
			return $returnValue;
		}
		*/
		
		try{
			$dateTime = new DateTime($value);
				
			if(!empty($this->options['comparator']) && $this->options['datetime2_ref'] instanceof tao_helpers_form_FormElement){
				//try comparison:
				try{
					$dateTime2 = new DateTime($this->options['datetime2_ref']->getRawValue());
				}catch(Exception $e){}
				
				if($dateTime2 instanceof DateTime){
					$this->message = __('Invalid date range');
					
					switch ($this->options['comparator']){
						case 'after':
						case 'later':
						case 'sup':
						case '>':{
							if($dateTime > $dateTime2){
								$returnValue = true;
							}else{
								$this->message .= ' (' . __('must be after: ').$dateTime2->format('Y-m-d').')';
								//TODO should add supprot of time: H:i:s
							}
							break;
						}
                        case '>=':{
                            if ($dateTime >= $dateTime2){
                                $returnValue = true;
                            }else{
                                $this->message .= ' (' . __('must be after or the same as: ').$dateTime2->format('Y-m-d').')';
                            }
                            break;
                        }
						case 'before':
						case 'earlier':
						case 'inf':
						case '<':{
							if($dateTime < $dateTime2){
								$returnValue = true;
							}else{
								$this->message .= ' (' . __('must be before: ').$dateTime2->format('Y-m-d').')';
								//TODO should add supprot of time: H:i:s
							}
							break;
						}
                        case '<=':{
                            if($dateTime <= $dateTime2){
                                $returnValue = true;
                            }else{
                                $this->message .= ' (' . __('must be before or the same as: ').$dateTime2->format('Y-m-d').')';
                            }
                            break;
                        }
						default:
							throw new common_Exception('Usuported comparator in DateTime Validator: '.$this->options['comparator']);
					}
				}
			
			}else{
				$returnValue = true; 
			}
		}catch(Exception $e){
			$this->message = __('The value of this field must be a valide date format, e.g. YYYY-MM-DD');
			$returnValue = false;
		}
		
        

        return (bool) $returnValue;
    }

} /* end of class tao_helpers_form_validators_DateTime */

?>